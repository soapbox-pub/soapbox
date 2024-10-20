/* eslint-disable compat/compat */
import { HTTPError } from 'soapbox/api/HTTPError';
import { MastodonClient } from 'soapbox/api/MastodonClient';
import { WebPushSubscription, webPushSubscriptionSchema } from 'soapbox/schemas/web-push';
import { decodeBase64Url } from 'soapbox/utils/base64';

// Last one checks for payload support: https://web-push-book.gauntface.com/chapter-06/01-non-standards-browsers/#no-payload
const supportsPushNotifications = ('serviceWorker' in navigator && 'PushManager' in window && 'getKey' in PushSubscription.prototype);

/**
 * Register web push notifications.
 * This function creates a subscription if one hasn't been created already, and syncronizes it with the backend.
 */
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

/** Get an existing subscription object from the browser if it exists, or ask the browser to create one. */
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

/** Request a subscription object from the web browser. */
async function createSubscription(vapidKey: string): Promise<PushSubscription> {
  const registration = await navigator.serviceWorker.ready;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeBase64Url(vapidKey),
  });
}

/** Fetch the API for an existing subscription saved in the backend, if any. */
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

/** Publish a new subscription to the backend. */
async function sendSubscriptionToBackend(api: MastodonClient, subscription: PushSubscription): Promise<WebPushSubscription> {
  const params = {
    subscription: subscription.toJSON(),
  };

  const response = await api.post('/api/v1/push/subscription', params);
  const data = await response.json();

  return webPushSubscriptionSchema.parse(data);
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

  const backendKeyBytes: Uint8Array = decodeBase64Url(backend.server_key);
  const subscriptionKeyBytes: Uint8Array = new Uint8Array(applicationServerKey);

  return backendKeyBytes.toString() === subscriptionKeyBytes.toString();
}