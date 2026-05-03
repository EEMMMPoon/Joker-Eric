export const VAPID_PUBLIC_KEY =
  'BGHC4LEgcSRLCwSR6ZgPfpwfgNcy_Iftn7McC5HFqg6OlTVdkuB-UwuwGSzJsEfpVZaKIIxYtWo3wqz1WiFWO3k';

/** Worker base URL — set VITE_WORKER_URL at build time for production. */
export const WORKER_BASE_URL: string = import.meta.env.VITE_WORKER_URL ?? '';

/** Converts a URL-safe base64 string to a Uint8Array (for VAPID subscription). */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

/**
 * Subscribes the current browser to push notifications and registers the
 * subscription with the Cloudflare Worker back-end.
 */
export async function subscribeToPush(
  registration: ServiceWorkerRegistration,
): Promise<void> {
  const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  if (!WORKER_BASE_URL) {
    console.warn('VITE_WORKER_URL is not set — subscription not sent to server.');
    return;
  }

  const response = await fetch(`${WORKER_BASE_URL}/subscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    throw new Error(`Server returned ${response.status}`);
  }
}
