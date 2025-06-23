import { Workbox } from 'workbox-window';

export interface PWAService {
  isUpdateAvailable: boolean;
  updateApp: () => Promise<void>;
  isOffline: boolean;
}

class PWAServiceImpl implements PWAService {
  private wb: Workbox | null = null;
  private updateCallback: (() => void) | null = null;
  
  public isUpdateAvailable = false;
  public isOffline = !navigator.onLine;

  constructor() {
    this.initializeServiceWorker();
    this.setupNetworkListeners();
  }

  private initializeServiceWorker() {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
      this.wb = new Workbox('/sw.js');
      
      this.wb.addEventListener('waiting', () => {
        this.isUpdateAvailable = true;
        this.notifyUpdateAvailable();
      });

      this.wb.addEventListener('controlling', () => {
        window.location.reload();
      });

      this.wb.register().catch((error) => {
        console.error('Service worker registration failed:', error);
      });
    }
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOffline = false;
      this.notifyNetworkChange();
    });

    window.addEventListener('offline', () => {
      this.isOffline = true;
      this.notifyNetworkChange();
    });
  }

  private notifyUpdateAvailable() {
    if (this.updateCallback) {
      this.updateCallback();
    }
  }

  private notifyNetworkChange() {
    // Emit custom event for network status change
    window.dispatchEvent(new CustomEvent('network-status-changed', {
      detail: { isOffline: this.isOffline }
    }));
  }

  public async updateApp(): Promise<void> {
    if (this.wb && this.isUpdateAvailable) {
      this.wb.messageSkipWaiting();
    }
  }

  public onUpdateAvailable(callback: () => void) {
    this.updateCallback = callback;
  }
}

// Create singleton instance
export const pwaService = new PWAServiceImpl();

// Auto-register the service worker
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  pwaService;
}
