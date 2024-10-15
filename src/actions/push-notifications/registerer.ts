/* eslint-disable compat/compat */
import { HTTPError } from 'soapbox/api/HTTPError';
import { MastodonClient } from 'soapbox/api/MastodonClient';
import { WebPushSubscription, webPushSubscriptionSchema } from 'soapbox/schemas/web-push';
import { decode as decodeBase64 } from 'soapbox/utils/base64';

/** Taken from https://www.npmjs.com/package/web-push */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  return decodeBase64(base64);
}

async function getBackendSubscription(api: MastodonClient): Promise<WebPushSubscription | null> {
  try {
    const response = await api.get('/api/v1/push/subscription');
    const data = await response.json();
    return webPushSubscriptionSchema.parse(data);
  } catch (e) {
    if (e instanceof HTTPError && e.response.status === 404) {
      return null;
    } else {
      throw e;
    }
  }
}

async function sendSubscriptionToBackend(api: MastodonClient, subscription: PushSubscription): Promise<WebPushSubscription> {
  const params = {
    subscription: subscription.toJSON(),
  };

  const response = await api.post('/api/v1/push/subscription', params);
  const data = await response.json();

  return webPushSubscriptionSchema.parse(data);
}

async function createSubscription(vapidKey: string): Promise<PushSubscription> {
  const registration = await navigator.serviceWorker.ready;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidKey),
  });
}

async function getOrCreateSubscription(vapidKey: string): Promise<{ subscription: PushSubscription; created: boolean }> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    return { subscription, created: false };
  } else {
    const subscription = await createSubscription(vapidKey);
    return { subscription, created: true };
  }
}

// Last one checks for payload support: https://web-push-book.gauntface.com/chapter-06/01-non-standards-browsers/#no-payload
const supportsPushNotifications = ('serviceWorker' in navigator && 'PushManager' in window && 'getKey' in PushSubscription.prototype);

export async function registerPushNotifications(api: MastodonClient, vapidKey: string) {
  if (!supportsPushNotifications) {
    console.warn('Your browser does not support Web Push Notifications.');
    return;
  }

  const { subscription, created } = await getOrCreateSubscription(vapidKey);

  if (created) {
    await sendSubscriptionToBackend(api, subscription);
    return;
  }

  // We have a subscription, check if it is still valid.
  const backend = await getBackendSubscription(api);

  // If the VAPID public key did not change and the endpoint corresponds
  // to the endpoint saved in the backend, the subscription is valid.
  if (backend && subscriptionMatchesBackend(subscription, backend)) {
    return;
  } else {
    // Something went wrong, try to subscribe again.
    await subscription.unsubscribe();
    const newSubscription = await createSubscription(vapidKey);
    await sendSubscriptionToBackend(api, newSubscription);
  }
}

/** Check if the VAPID key and endpoint of the subscription match the data in the backend. */
function subscriptionMatchesBackend(subscription: PushSubscription, backend: WebPushSubscription): boolean {
  const { applicationServerKey } = subscription.options;

  if (subscription.endpoint !== backend.endpoint) {
    return false;
  }

  if (!applicationServerKey) {
    return false;
  }

  const backendKeyBytes: Uint8Array = urlBase64ToUint8Array(backend.server_key);
  const subscriptionKeyBytes: Uint8Array = new Uint8Array(applicationServerKey);

  return backendKeyBytes.toString() === subscriptionKeyBytes.toString();
}