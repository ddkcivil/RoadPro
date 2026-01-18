import { Project } from '../types';

interface OfflineQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  dataType: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

class OfflineDataManager {
  private queueKey = 'roadmaster-offline-queue';
  private isOnline = navigator.onLine;

  constructor() {
    this.setupNetworkListeners();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  /**
   * Add an item to the offline queue for later sync
   */
  addToOfflineQueue(dataType: string, action: 'create' | 'update' | 'delete', data: any): string {
    const queue = this.getOfflineQueue();
    const itemId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const queueItem: OfflineQueueItem = {
      id: itemId,
      action,
      dataType,
      data,
      timestamp: Date.now(),
      synced: false
    };

    queue.push(queueItem);
    this.saveOfflineQueue(queue);
    
    return itemId;
  }

  /**
   * Get the current offline queue
   */
  getOfflineQueue(): OfflineQueueItem[] {
    const queueString = localStorage.getItem(this.queueKey);
    return queueString ? JSON.parse(queueString) : [];
  }

  /**
   * Save the offline queue to localStorage
   */
  saveOfflineQueue(queue: OfflineQueueItem[]) {
    localStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  /**
   * Mark an item as synced
   */
  markAsSynced(itemId: string) {
    const queue = this.getOfflineQueue();
    const itemIndex = queue.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      queue[itemIndex].synced = true;
      this.saveOfflineQueue(queue);
    }
  }

  /**
   * Remove synced items from the queue
   */
  cleanupSyncedItems() {
    const queue = this.getOfflineQueue();
    const filteredQueue = queue.filter(item => !item.synced);
    this.saveOfflineQueue(filteredQueue);
  }

  /**
   * Process the offline queue when online
   */
  async processOfflineQueue() {
    if (!this.isOnline) return;

    const queue = this.getOfflineQueue();
    const unsyncedItems = queue.filter(item => !item.synced);

    for (const item of unsyncedItems) {
      try {
        // In a real implementation, this would sync with the backend
        // For now, we'll just mark as synced after a delay to simulate processing
        await this.simulateSync(item);
        this.markAsSynced(item.id);
      } catch (error) {
        console.error(`Failed to sync item ${item.id}:`, error);
        // Optionally, we could mark items as failed or retry later
      }
    }

    // Clean up synced items
    this.cleanupSyncedItems();
  }

  /**
   * Simulate syncing an item (in a real app, this would call an API)
   */
  private async simulateSync(item: OfflineQueueItem): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real implementation, this would send the data to the backend
    // For now, we just resolve the promise to indicate success
    console.log(`Simulated sync of ${item.action} ${item.dataType} with data:`, item.data);
  }

  /**
   * Check if the app is currently online
   */
  getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Get count of pending offline items
   */
  getPendingItemCount(): number {
    const queue = this.getOfflineQueue();
    return queue.filter(item => !item.synced).length;
  }
}

// Export a singleton instance
export const offlineManager = new OfflineDataManager();

/**
 * Hook up to the window load event to process queue when the app starts
 */
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Process queue after a short delay to allow the app to initialize
    setTimeout(() => {
      offlineManager.processOfflineQueue();
    }, 1000);
  });
}