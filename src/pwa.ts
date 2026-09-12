import { Capacitor } from '@capacitor/core';

let waitingWorker: ServiceWorker | null = null;
const listeners = new Set<() => void>();

function announceUpdate(worker: ServiceWorker): void {
  waitingWorker = worker;
  for (const listener of listeners) listener();
}

export function subscribeToUpdate(listener: () => void): () => void {
  listeners.add(listener);
  if (waitingWorker) listener();
  return () => {
    listeners.delete(listener);
  };
}

export function activateUpdate(): void {
  if (!waitingWorker) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
    once: true,
  });
  waitingWorker.postMessage({ type: 'SKIP_WAITING' });
}

export async function registerServiceWorker(): Promise<void> {
  if (
    !import.meta.env.PROD ||
    Capacitor.isNativePlatform() ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    if (registration.waiting && navigator.serviceWorker.controller) {
      announceUpdate(registration.waiting);
    }
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          announceUpdate(worker);
        }
      });
    });
    await registration.update();
  } catch (error) {
    console.error('service worker registration failed', error);
  }
}
