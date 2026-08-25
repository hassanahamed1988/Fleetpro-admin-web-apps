import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import 'dotenv/config';
import fs from 'fs';

async function clearUsers() {
  try {
    let projectId = process.env.FIREBASE_PROJECT_ID;
    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    let formattedPrivateKey = privateKey;
    let actualProjectId = projectId;
    let actualClientEmail = clientEmail;

    try {
      if (privateKey.trim().startsWith('{')) {
        const parsedKey = JSON.parse(privateKey);
        if (parsedKey.private_key) formattedPrivateKey = parsedKey.private_key;
        if (parsedKey.project_id) actualProjectId = parsedKey.project_id;
        if (parsedKey.client_email) actualClientEmail = parsedKey.client_email;
      }
    } catch (e) {}

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

    // IMPORTANT: the app itself (src/db/index.ts, src/lib/firebaseAdmin.ts)
    // reads/writes the Firestore database named in firebase-applet-config.json
    // ("fleetpromanager"), NOT a database literally named "admin". Passing
    // 'admin' here pointed this script at a different, unused database, so
    // running it looked successful but never touched the real user data.
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
    console.log(`Using Firestore database: "${databaseId}"`);

    const db = getFirestore(databaseId);
    const usersSnapshot = await db.collection('users').get();
    
    for (const doc of usersSnapshot.docs) {
      console.log('Deleting user:', doc.id);
      await doc.ref.delete();
    }
    console.log('Done deleting previous users.');
  } catch (err) {
    console.error('Error:', err);
  }
}

clearUsers();
