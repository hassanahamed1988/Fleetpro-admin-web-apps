/**
 * migrate-sync-passwords.js
 *
 * ONE-OFF MIGRATION: backfills the `password` field (bcrypt hash) on every
 * existing user document that only has `passwordHash` set.
 *
 * WHY THIS IS NEEDED:
 * The Mobile App validates credentials by reading `password` directly from
 * the Firestore user document (see Login.tsx). The Admin Panel backend used
 * to store the bcrypt hash only under `passwordHash` and delete `password`
 * entirely. That has now been fixed for NEW accounts (server.ts keeps both
 * fields in sync going forward), but accounts created BEFORE that fix still
 * have no `password` field at all, so they still can't log into the mobile
 * app. This script fixes those existing accounts, once.
 *
 * WHAT IT DOES:
 * For every document in the `users` collection:
 *   - If `passwordHash` exists and `password` is missing/empty, it copies
 *     the bcrypt hash into `password`.
 *   - If `password` already exists (any value), the document is left
 *     untouched — this script never overwrites an existing password.
 *   - If neither field exists, the document is skipped and reported.
 *
 * USAGE:
 *   1. Fill in the Firebase Admin SDK credentials below (same values as
 *      FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
 *      in your .env, or just make sure .env is present — dotenv is loaded
 *      automatically).
 *   2. Dry run first (recommended) — only prints what WOULD change:
 *        node migrate-sync-passwords.js --dry-run
 *   3. Then actually apply the fix:
 *        node migrate-sync-passwords.js
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';
import fs from 'fs';

const isDryRun = process.argv.includes('--dry-run');

async function main() {
  try {
    let projectId = process.env.FIREBASE_PROJECT_ID;
    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    let formattedPrivateKey = privateKey;
    let actualProjectId = projectId;
    let actualClientEmail = clientEmail;

    try {
      if (privateKey && privateKey.trim().startsWith('{')) {
        const parsedKey = JSON.parse(privateKey);
        if (parsedKey.private_key) formattedPrivateKey = parsedKey.private_key;
        if (parsedKey.project_id) actualProjectId = parsedKey.project_id;
        if (parsedKey.client_email) actualClientEmail = parsedKey.client_email;
      }
    } catch (e) {}

    if (!formattedPrivateKey || !actualProjectId || !actualClientEmail) {
      console.error(
        'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, ' +
        'FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in your .env file ' +
        '(same values used by clear-db.js) before running this script.'
      );
      process.exit(1);
    }

    formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');

    if (getApps().length === 0) {
      initializeApp({
        credential: cert({
          projectId: actualProjectId,
          clientEmail: actualClientEmail,
          privateKey: formattedPrivateKey,
        }),
      });
    }

    // IMPORTANT: use the SAME Firestore database ID the live app actually
    // reads/writes (see firebase-applet-config.json -> firestoreDatabaseId).
    // firebase-admin defaults to a database literally named "admin" if you
    // don't pass an ID, which is a DIFFERENT database from the one this
    // project uses ('fleetpromanager') — running against the wrong database
    // would silently touch zero real user documents.
    let databaseId = process.env.FIREBASE_DATABASE_ID;
    if (!databaseId) {
      try {
        const raw = fs.readFileSync(new URL('./firebase-applet-config.json', import.meta.url));
        const cfg = JSON.parse(raw);
        databaseId = cfg.firestoreDatabaseId || cfg.databaseId || 'fleetpromanager';
      } catch (e) {
        databaseId = 'fleetpromanager';
      }
    }
    console.log(`Using Firestore database: "${databaseId}"${isDryRun ? '  [DRY RUN - no writes will be made]' : ''}`);

    const db = getFirestore(databaseId);
    const usersSnapshot = await db.collection('users').get();

    let scanned = 0;
    let toUpdate = [];
    let alreadyOk = 0;
    let noHashAtAll = [];

    usersSnapshot.forEach((docSnap) => {
      scanned++;
      const data = docSnap.data();
      const hasPassword = typeof data.password === 'string' && data.password.length > 0;
      const hasHash = typeof data.passwordHash === 'string' && data.passwordHash.length > 0;

      if (hasPassword) {
        alreadyOk++;
      } else if (hasHash) {
        toUpdate.push({ id: docSnap.id, name: data.name || data.email || docSnap.id, hash: data.passwordHash });
      } else {
        noHashAtAll.push({ id: docSnap.id, name: data.name || data.email || docSnap.id });
      }
    });

    console.log(`\nScanned ${scanned} user document(s):`);
    console.log(`  - Already have a "password" field (untouched): ${alreadyOk}`);
    console.log(`  - Will be backfilled from "passwordHash":       ${toUpdate.length}`);
    console.log(`  - Have neither field (cannot fix automatically): ${noHashAtAll.length}`);

    if (toUpdate.length > 0) {
      console.log('\nAccounts to backfill:');
      toUpdate.forEach((u) => console.log(`  - ${u.id} (${u.name})`));
    }
    if (noHashAtAll.length > 0) {
      console.log('\n⚠ Accounts with NO password/passwordHash at all (will need a manual password reset):');
      noHashAtAll.forEach((u) => console.log(`  - ${u.id} (${u.name})`));
    }

    if (isDryRun) {
      console.log('\nDry run complete. No changes were written. Re-run without --dry-run to apply.');
      return;
    }

    if (toUpdate.length === 0) {
      console.log('\nNothing to update. Done.');
      return;
    }

    // Firestore batches are capped at 500 writes; chunk to be safe.
    const CHUNK_SIZE = 400;
    let updated = 0;
    for (let i = 0; i < toUpdate.length; i += CHUNK_SIZE) {
      const chunk = toUpdate.slice(i, i + CHUNK_SIZE);
      const batch = db.batch();
      chunk.forEach((u) => {
        batch.set(db.collection('users').doc(u.id), { password: u.hash }, { merge: true });
      });
      await batch.commit();
      updated += chunk.length;
      console.log(`Committed ${updated}/${toUpdate.length}...`);
    }

    console.log(`\n✅ Done. Backfilled "password" for ${updated} existing account(s). They should now be able to log into the Mobile App with their existing password.`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

main();
