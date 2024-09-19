import { useFeatures } from './useFeatures';
import { useOwnAccount } from './useOwnAccount';
import { useSettings } from './useSettings';

type SettingsNotification = 'needsNip05';

/** Get a list of notifications for settings. */
export function useSettingsNotifications(): Set<SettingsNotification> {
  const notifications: Set<SettingsNotification> = new Set();

  const features = useFeatures();
  const { account } = useOwnAccount();
  const { dismissedSettingsNotifications } = useSettings();

  if (
    !dismissedSettingsNotifications.includes('needsNip05')
    && account
    && features.nip05
    && account.acct !== account.source?.nostr?.nip05
  ) {
    notifications.add('needsNip05');
  }

  return notifications;
}