import { useFeatures } from './useFeatures.ts';
import { useOwnAccount } from './useOwnAccount.ts';
import { useSettings } from './useSettings.ts';

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