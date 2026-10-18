import { LocalMediaItem } from '@/types/media-browser';

const DB_NAME = 'wavo_media_library';
const DB_VERSION = 1;
const STORE_NAME = 'recent_media';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('addedAt', 'addedAt', { unique: false });
        store.createIndex('lastModified', 'lastModified', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveRecentMedia(item: LocalMediaItem): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Exclude actual File or Blob from storage to conserve storage quota and avoid cloning errors
    const record = {
      id: item.id,
      name: item.name,
      size: item.size,
      type: item.type,
      lastModified: item.lastModified,
      duration: item.duration || 0,
      lastPlayedPosition: item.lastPlayedPosition || 0,
      addedAt: item.addedAt || Date.now(),
    };

    await new Promise<void>((resolve, reject) => {
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Fallback to localStorage
    if (typeof window !== 'undefined') {
      try {
        const key = 'wavo_recent_media_fallback';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = [item, ...existing.filter((x: any) => x.id !== item.id)].slice(0, 20);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.warn('Local storage fallback error:', e);
      }
    }
  }
}

export async function getRecentMedia(): Promise<LocalMediaItem[]> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result || [];
        results.sort((a: any, b: any) => (b.addedAt || 0) - (a.addedAt || 0));
        resolve(results);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('wavo_recent_media_fallback');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  }
}

export async function removeRecentMedia(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch {
    if (typeof window !== 'undefined') {
      try {
        const key = 'wavo_recent_media_fallback';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const updated = existing.filter((x: any) => x.id !== id);
        localStorage.setItem(key, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
    }
  }
}

export async function clearRecentMedia(): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wavo_recent_media_fallback');
    }
  }
}
