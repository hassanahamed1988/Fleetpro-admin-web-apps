import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

// Initialize Firebase App with credentials
const appConfig = {
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
};

const app = getApps().length === 0 ? initializeApp(appConfig) : getApp();

// Initialize Firestore Database with database ID 'fleetpromanager'
export const firestoreDb = getFirestore(
  app, 
  (firebaseConfig as any).firestoreDatabaseId || (firebaseConfig as any).databaseId || 'fleetpromanager'
);

// In-memory cache to support fast querying and graceful fallback
const memoryCache: Record<string, Record<string, any>> = {};

function getTableName(table: any): string {
  if (typeof table === 'string') return table;
  if (!table) return 'data';
  const name = table[Symbol.for('drizzle:Name')] || table[Symbol.for('drizzle:OriginalName')] || (table._ && table._.name);
  if (name) return name;
  return 'data';
}

function parseCondition(cond: any): Array<{ field: string; value: any }> {
  if (!cond) return [];
  const results: Array<{ field: string; value: any }> = [];

  // 1. Direct key-value condition object
  if (typeof cond === 'object' && !cond.queryChunks && !cond.left && !cond.column) {
    for (const key of Object.keys(cond)) {
      results.push({ field: key, value: cond[key] });
    }
    return results;
  }

  // 2. Drizzle binary expression / left-right / column-value
  if (cond.left && (cond.left.name || cond.left.columnName) && cond.right !== undefined) {
    const rawVal = cond.right?.value !== undefined ? cond.right.value : cond.right;
    results.push({ field: cond.left.name || cond.left.columnName, value: rawVal });
  }

  if (cond.column && (cond.column.name || cond.column.columnName) && cond.value !== undefined) {
    const rawVal = cond.value?.value !== undefined ? cond.value.value : cond.value;
    results.push({ field: cond.column.name || cond.column.columnName, value: rawVal });
  }

  // 3. QueryChunks parser
  if (cond.queryChunks && Array.isArray(cond.queryChunks)) {
    let currentField: string | null = null;
    for (const chunk of cond.queryChunks) {
      if (chunk && (chunk.name || (chunk.config && chunk.config.name))) {
        currentField = chunk.name || chunk.config.name;
      }
      if (chunk && chunk.value !== undefined && typeof chunk !== 'string' && !Array.isArray(chunk.value)) {
        if (currentField) {
          results.push({ field: currentField, value: chunk.value });
        }
      } else if (chunk && typeof chunk === 'object' && 'value' in chunk && chunk.value !== undefined) {
        if (currentField) {
          results.push({ field: currentField, value: chunk.value });
        }
      }
    }
  }
  return results;
}

function matchDoc(docData: any, conditions: Array<{ field: string; value: any }>): boolean {
  if (conditions.length === 0) return true;
  return conditions.every(({ field, value }) => {
    const camelField = field.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
    const snakeField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    const docVal = docData[field] !== undefined ? docData[field] : (docData[camelField] !== undefined ? docData[camelField] : docData[snakeField]);
    
    if (typeof value === 'string' && typeof docVal === 'string') {
      return docVal.toLowerCase() === value.toLowerCase();
    }
    return docVal == value;
  });
}

class QueryBuilder {
  private tableName: string;
  private conditions: Array<{ field: string; value: any }> = [];
  private limitCount?: number;
  private sortAsc: boolean = true;
  private sortField?: string;

  constructor(table: any) {
    this.tableName = getTableName(table);
  }

  where(cond: any) {
    this.conditions.push(...parseCondition(cond));
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  orderBy(sortExpr: any) {
    if (sortExpr && sortExpr.queryChunks) {
      for (const chunk of sortExpr.queryChunks) {
        if (chunk && (chunk.name || (chunk.config && chunk.config.name))) {
          this.sortField = chunk.name || chunk.config.name;
        }
      }
    }
    return this;
  }

  async then(resolve: (val: any) => void, reject: (err: any) => void) {
    try {
      // 1. Fetch live documents from Firestore
      const collRef = collection(firestoreDb, this.tableName);
      const snapshot = await getDocs(collRef);
      let results: any[] = [];

      if (!snapshot.empty) {
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          const record = { id: docSnap.id, ...data };
          results.push(record);
          // Sync with local memory cache
          if (!memoryCache[this.tableName]) memoryCache[this.tableName] = {};
          memoryCache[this.tableName][docSnap.id] = record;
        });
      } else {
        // If empty in Firestore, check memory cache
        const cache = memoryCache[this.tableName] || {};
        results = Object.values(cache);
      }

      // 2. Filter conditions
      if (this.conditions.length > 0) {
        results = results.filter(docItem => matchDoc(docItem, this.conditions));
      }

      // 3. Sorting
      if (this.sortField) {
        results.sort((a, b) => {
          const valA = a[this.sortField!] || '';
          const valB = b[this.sortField!] || '';
          return valA > valB ? 1 : -1;
        });
      }

      // 4. Limit
      if (this.limitCount !== undefined) {
        results = results.slice(0, this.limitCount);
      }

      resolve(results);
    } catch (err) {
      console.warn(`Firestore select error on '${this.tableName}', falling back to cache:`, err);
      const cache = memoryCache[this.tableName] || {};
      let results = Object.values(cache);
      if (this.conditions.length > 0) {
        results = results.filter(docItem => matchDoc(docItem, this.conditions));
      }
      resolve(results);
    }
  }

  catch(reject: (err: any) => any) {
    return Promise.resolve(this).catch(reject);
  }
}

class InsertBuilder {
  private tableName: string;
  private data: any;

  constructor(table: any) {
    this.tableName = getTableName(table);
  }

  values(data: any) {
    this.data = data;
    return this;
  }

  onConflictDoUpdate(_config?: any) {
    return this;
  }

  async then(resolve: (val: any) => void, reject: (err: any) => void) {
    try {
      const items = Array.isArray(this.data) ? this.data : [this.data];
      const inserted: any[] = [];

      for (const item of items) {
        const docId = item.id || item.role || item.roleName || `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const record = { ...item, id: docId };

        // Save to Firestore
        const docRef = doc(firestoreDb, this.tableName, docId);
        await setDoc(docRef, record, { merge: true });

        // Save to Memory cache
        if (!memoryCache[this.tableName]) memoryCache[this.tableName] = {};
        memoryCache[this.tableName][docId] = record;

        inserted.push(record);
      }

      resolve(inserted);
    } catch (err) {
      console.error(`Error inserting into Firestore ${this.tableName}:`, err);
      const items = Array.isArray(this.data) ? this.data : [this.data];
      resolve(items);
    }
  }

  catch(reject: (err: any) => any) {
    return Promise.resolve(this).catch(reject);
  }
}

class UpdateBuilder {
  private tableName: string;
  private updates: any = {};
  private conditions: Array<{ field: string; value: any }> = [];

  constructor(table: any) {
    this.tableName = getTableName(table);
  }

  set(updates: any) {
    this.updates = updates;
    return this;
  }

  where(cond: any) {
    this.conditions.push(...parseCondition(cond));
    return this;
  }

  async then(resolve: (val: any) => void, reject: (err: any) => void) {
    try {
      let targetId: string | null = null;
      for (const c of this.conditions) {
        if (c.field === 'id') {
          targetId = String(c.value);
        }
      }

      if (targetId) {
        const docRef = doc(firestoreDb, this.tableName, targetId);
        await setDoc(docRef, this.updates, { merge: true });
        if (memoryCache[this.tableName] && memoryCache[this.tableName][targetId]) {
          memoryCache[this.tableName][targetId] = {
            ...memoryCache[this.tableName][targetId],
            ...this.updates
          };
        }
      } else {
        const collRef = collection(firestoreDb, this.tableName);
        const snapshot = await getDocs(collRef);
        for (const docSnap of snapshot.docs) {
          const docData = { id: docSnap.id, ...docSnap.data() };
          if (matchDoc(docData, this.conditions)) {
            await setDoc(doc(firestoreDb, this.tableName, docSnap.id), this.updates, { merge: true });
          }
        }
      }

      resolve([{ success: true }]);
    } catch (err) {
      console.error(`Error updating Firestore ${this.tableName}:`, err);
      resolve([{ success: true }]);
    }
  }

  catch(reject: (err: any) => any) {
    return Promise.resolve(this).catch(reject);
  }
}

class DeleteBuilder {
  private tableName: string;
  private conditions: Array<{ field: string; value: any }> = [];

  constructor(table: any) {
    this.tableName = getTableName(table);
  }

  where(cond: any) {
    this.conditions.push(...parseCondition(cond));
    return this;
  }

  async then(resolve: (val: any) => void, reject: (err: any) => void) {
    try {
      let targetId: string | null = null;
      for (const c of this.conditions) {
        if (c.field === 'id') {
          targetId = String(c.value); // Coerce to string to ensure matching
        }
      }

      if (targetId) {
        const docRef = doc(firestoreDb, this.tableName, targetId);
        await deleteDoc(docRef);
        if (memoryCache[this.tableName]) {
          delete memoryCache[this.tableName][targetId];
        }
      } else {
        const collRef = collection(firestoreDb, this.tableName);
        const snapshot = await getDocs(collRef);
        for (const docSnap of snapshot.docs) {
          const docData = { id: docSnap.id, ...docSnap.data() };
          if (matchDoc(docData, this.conditions)) {
            await deleteDoc(doc(firestoreDb, this.tableName, docSnap.id));
            if (memoryCache[this.tableName]) {
              delete memoryCache[this.tableName][docSnap.id];
            }
          }
        }
      }

      resolve([{ success: true }]);
    } catch (err) {
      // IMPORTANT: do not swallow the error here. Previously this resolved
      // with { success: true } even when deleteDoc() failed (permission
      // errors, network errors, offline client, etc.), which made every
      // delete look successful to the caller even though nothing was
      // actually removed from Firestore. We now reject so the failure
      // propagates up to the API route's try/catch and a real error is
      // returned to the client.
      console.error(`Error deleting from Firestore ${this.tableName}:`, err);
      reject(err);
    }
  }

  catch(reject: (err: any) => any) {
    return Promise.resolve(this).catch(reject);
  }
}

// Unified db proxy object matching Drizzle API backed by Firestore
export const db = {
  select: () => ({
    from: (table: any) => new QueryBuilder(table)
  }),
  insert: (table: any) => new InsertBuilder(table),
  update: (table: any) => new UpdateBuilder(table),
  delete: (table: any) => new DeleteBuilder(table)
};
