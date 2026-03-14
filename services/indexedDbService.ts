import { Note, User } from '../types';

const DB_NAME = 'cloudnotes-db';
const DB_VERSION = 1;

const STORE_USERS = 'users';
const STORE_NOTES = 'userNotes';
const STORE_SESSION = 'session';

interface StoredUser extends User {
  password: string;
}

interface UserNotesRecord {
  userEmail: string;
  notes: Note[];
}

interface SessionRecord {
  key: 'currentUser';
  user: User | null;
}

const isIndexedDbSupported = (): boolean => {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
};

const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getUsersFromLocalStorage = (): StoredUser[] => {
  return safeJsonParse<StoredUser[]>(localStorage.getItem('cn_registered_users'), []);
};

const setUsersToLocalStorage = (users: StoredUser[]): void => {
  localStorage.setItem('cn_registered_users', JSON.stringify(users));
};

const openDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'email' });
      }

      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: 'userEmail' });
      }

      if (!db.objectStoreNames.contains(STORE_SESSION)) {
        db.createObjectStore(STORE_SESSION, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const runTransaction = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore, resolve: (value: T) => void, reject: (reason?: any) => void) => void
): Promise<T> => {
  const db = await openDb();

  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    operation(store, resolve, reject);

    tx.oncomplete = () => db.close();
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
};

export const getRegisteredUsers = async (): Promise<StoredUser[]> => {
  if (!isIndexedDbSupported()) {
    return getUsersFromLocalStorage();
  }

  try {
    return await runTransaction<StoredUser[]>(STORE_USERS, 'readonly', (store, resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result || []) as StoredUser[]);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return getUsersFromLocalStorage();
  }
};

export const getUserByEmail = async (email: string): Promise<StoredUser | null> => {
  if (!isIndexedDbSupported()) {
    const users = getUsersFromLocalStorage();
    return users.find(user => user.email === email) || null;
  }

  try {
    return await runTransaction<StoredUser | null>(STORE_USERS, 'readonly', (store, resolve, reject) => {
      const req = store.get(email);
      req.onsuccess = () => resolve((req.result as StoredUser) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    const users = getUsersFromLocalStorage();
    return users.find(user => user.email === email) || null;
  }
};

export const createUser = async (user: StoredUser): Promise<void> => {
  if (!isIndexedDbSupported()) {
    const users = getUsersFromLocalStorage();
    setUsersToLocalStorage([...users, user]);
    return;
  }

  try {
    await runTransaction<void>(STORE_USERS, 'readwrite', (store, resolve, reject) => {
      const req = store.add(user);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    const users = getUsersFromLocalStorage();
    const exists = users.some(existing => existing.email === user.email);
    if (!exists) {
      setUsersToLocalStorage([...users, user]);
    }
  }
};

export const findUserByCredentials = async (
  email: string,
  password: string
): Promise<User | null> => {
  const existing = await getUserByEmail(email);
  if (!existing || existing.password !== password) {
    return null;
  }

  return {
    username: existing.username,
    email: existing.email,
  };
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!isIndexedDbSupported()) {
    return safeJsonParse<User | null>(localStorage.getItem('cn_user'), null);
  }

  try {
    return await runTransaction<User | null>(STORE_SESSION, 'readonly', (store, resolve, reject) => {
      const req = store.get('currentUser');
      req.onsuccess = () => {
        const record = req.result as SessionRecord | undefined;
        resolve(record?.user || null);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return safeJsonParse<User | null>(localStorage.getItem('cn_user'), null);
  }
};

export const setCurrentUser = async (user: User | null): Promise<void> => {
  if (!isIndexedDbSupported()) {
    localStorage.setItem('cn_user', JSON.stringify(user));
    return;
  }

  try {
    await runTransaction<void>(STORE_SESSION, 'readwrite', (store, resolve, reject) => {
      const req = store.put({ key: 'currentUser', user } as SessionRecord);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    localStorage.setItem('cn_user', JSON.stringify(user));
  }
};

export const clearCurrentUser = async (): Promise<void> => {
  if (!isIndexedDbSupported()) {
    localStorage.removeItem('cn_user');
    return;
  }

  try {
    await runTransaction<void>(STORE_SESSION, 'readwrite', (store, resolve, reject) => {
      const req = store.delete('currentUser');
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    localStorage.removeItem('cn_user');
  }
};

export const getUserNotes = async (userEmail: string): Promise<Note[]> => {
  if (!isIndexedDbSupported()) {
    return safeJsonParse<Note[]>(localStorage.getItem(`cn_notes_${userEmail}`), []);
  }

  try {
    return await runTransaction<Note[]>(STORE_NOTES, 'readonly', (store, resolve, reject) => {
      const req = store.get(userEmail);
      req.onsuccess = () => {
        const record = req.result as UserNotesRecord | undefined;
        resolve(record?.notes || []);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return safeJsonParse<Note[]>(localStorage.getItem(`cn_notes_${userEmail}`), []);
  }
};

export const setUserNotes = async (userEmail: string, notes: Note[]): Promise<void> => {
  if (!isIndexedDbSupported()) {
    localStorage.setItem(`cn_notes_${userEmail}`, JSON.stringify(notes));
    return;
  }

  try {
    await runTransaction<void>(STORE_NOTES, 'readwrite', (store, resolve, reject) => {
      const req = store.put({ userEmail, notes } as UserNotesRecord);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    localStorage.setItem(`cn_notes_${userEmail}`, JSON.stringify(notes));
  }
};

export const migrateLegacyLocalStorageData = async (): Promise<void> => {
  const migrationKey = 'cn_indexeddb_migrated_v1';
  if (localStorage.getItem(migrationKey) === 'true') {
    return;
  }

  try {
    const rawUsers = localStorage.getItem('cn_registered_users');
    if (rawUsers) {
      const parsedUsers = JSON.parse(rawUsers) as StoredUser[];
      for (const user of parsedUsers) {
        if (!user?.email) continue;
        const existing = await getUserByEmail(user.email);
        if (!existing) {
          await createUser(user);
        }
      }
    }

    const rawSessionUser = localStorage.getItem('cn_user');
    if (rawSessionUser) {
      const parsedSessionUser = JSON.parse(rawSessionUser) as User;
      if (parsedSessionUser?.email) {
        await setCurrentUser(parsedSessionUser);
      }
    }

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith('cn_notes_')) continue;

      const userEmail = key.replace('cn_notes_', '');
      const rawNotes = localStorage.getItem(key);
      if (!userEmail || !rawNotes) continue;

      const existingNotes = await getUserNotes(userEmail);
      if (existingNotes.length > 0) continue;

      const parsedNotes = JSON.parse(rawNotes) as Note[];
      await setUserNotes(userEmail, parsedNotes);
    }

    localStorage.setItem(migrationKey, 'true');
  } catch (error) {
    console.error('Legacy localStorage migration failed:', error);
  }
};