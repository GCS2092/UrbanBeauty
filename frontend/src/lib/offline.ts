// Utilities to manage offline mode

import { supabase } from './supabase';

export interface OfflineQueueItem {
  id: string;
  type: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  data: any;
  timestamp: number;
}

class OfflineManager {
  private queue: OfflineQueueItem[] = [];
  private dbName = 'urbanbeauty-offline';
  private storeName = 'queue';
  private db: IDBDatabase | null = null;

  async init() {
    if (typeof window === 'undefined') return;

    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        this.loadQueue().then(() => resolve());
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };
    });
  }

  async loadQueue() {
    if (!this.db) return;

    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        this.queue = request.result || [];
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async addToQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) {
    if (typeof window === 'undefined') return;

    const queueItem: OfflineQueueItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.queue.push(queueItem);

    if (this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.add(queueItem);
    }

    // Notify the service worker
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'QUEUE_ITEM',
        item: queueItem,
      });
    }

    return queueItem.id;
  }

  async removeFromQueue(id: string) {
    this.queue = this.queue.filter((item) => item.id !== id);

    if (this.db) {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      await store.delete(id);
    }
  }

  getQueue(): OfflineQueueItem[] {
    return [...this.queue];
  }

  async syncQueue() {
    if (!navigator.onLine || this.queue.length === 0) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;

    const itemsToSync = [...this.queue];
    const { data: sessionData } = await supabase.auth.getSession();
    const accessToken = sessionData.session?.access_token;

    for (const item of itemsToSync) {
      try {
        const response = await fetch(item.url, {
          method: item.type,
          headers: {
            'Content-Type': 'application/json',
            Authorization: accessToken ? `Bearer ${accessToken}` : '',
          },
          body: JSON.stringify(item.data),
        });

        if (response.ok) {
          await this.removeFromQueue(item.id);
          success++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error('Failed to sync item:', item, error);
        failed++;
      }
    }

    return { success, failed };
  }

  async registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      // Wait for the service worker to be activated
      if (registration.installing) {
        await new Promise((resolve) => {
          registration.installing!.addEventListener('statechange', function () {
            if (this.state === 'installed') {
              resolve(null);
            }
          });
        });
      }

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }

  onOnline(callback: () => void) {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', callback);
  }

  onOffline(callback: () => void) {
    if (typeof window === 'undefined') return;
    window.addEventListener('offline', callback);
  }
}

export const offlineManager = new OfflineManager();

// Initialize on load
if (typeof window !== 'undefined') {
  offlineManager.init().then(() => {
    // Auto-sync when connection returns
    offlineManager.onOnline(() => {
      offlineManager.syncQueue().then((result) => {
        if (result.success > 0) {
          console.log(`Synced ${result.success} item(s)`);
          // Optional: show a notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Sync complete', {
              body: `${result.success} item(s) were synced`,
              icon: '/icon-192x192.png',
            });
          }
        }
      });
    });
  });
}
