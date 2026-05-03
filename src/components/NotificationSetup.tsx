import { useState, useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { subscribeToPush, WORKER_BASE_URL } from '../lib/pushUtils';

type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export default function NotificationSetup() {
  const [permission, setPermission] = useState<PermissionState>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const isIOS =
    /iP(hone|od|ad)/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;

  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW();

  useEffect(() => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as PermissionState);
    setSubscribed(localStorage.getItem('cap621_subscribed') === 'true');
  }, []);

  async function handleSubscribe() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatusMsg('Push notifications are not supported in this browser.');
      return;
    }

    setLoading(true);
    setStatusMsg('');
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as PermissionState);

      if (perm !== 'granted') {
        setStatusMsg('Permission was not granted. Please allow notifications in your browser settings.');
        setLoading(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      await subscribeToPush(reg);

      localStorage.setItem('cap621_subscribed', 'true');
      setSubscribed(true);
      setStatusMsg(
        WORKER_BASE_URL
          ? '✅ Subscribed! You will receive daily reminders at 18:30 HKT.'
          : '✅ Subscribed locally. (No server configured — daily push requires VITE_WORKER_URL.)',
      );
    } catch (err) {
      console.error(err);
      setStatusMsg(`Failed to subscribe: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  if (permission === 'unsupported') {
    return (
      <section className="notif-setup notif-setup--unsupported">
        <p>Push notifications are not supported in this browser.</p>
      </section>
    );
  }

  return (
    <section className="notif-setup">
      <h2 className="notif-setup__title">🔔 Daily Reminders</h2>

      {isIOS && (
        <p className="notif-setup__ios-hint">
          <strong>iOS users:</strong> Add this app to your Home Screen via the Share button, then re-open it to enable push notifications.
        </p>
      )}

      <div className="notif-setup__status">
        <span>Permission:</span>
        <strong className={`notif-perm notif-perm--${permission}`}>
          {permission.charAt(0).toUpperCase() + permission.slice(1)}
        </strong>
      </div>

      {needRefresh && (
        <p className="notif-setup__update">
          A new version is available.{' '}
          <button className="btn btn--link" onClick={() => updateServiceWorker(true)}>
            Update now
          </button>
        </p>
      )}

      {!subscribed && permission !== 'denied' && (
        <button
          className="btn btn--subscribe"
          onClick={handleSubscribe}
          disabled={loading}
        >
          {loading ? 'Subscribing…' : 'Subscribe to daily reminders'}
        </button>
      )}

      {subscribed && (
        <p className="notif-setup__subscribed">
          ✅ You are subscribed to daily reminders.
        </p>
      )}

      {permission === 'denied' && (
        <p className="notif-setup__denied">
          Notifications are blocked. Please enable them in your browser or device settings.
        </p>
      )}

      {statusMsg && <p className="notif-setup__msg">{statusMsg}</p>}
    </section>
  );
}
