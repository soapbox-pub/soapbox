import { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchMfa } from 'soapbox/actions/mfa.ts';
import CopyableInput from 'soapbox/components/copyable-input.tsx';
import List, { ListItem } from 'soapbox/components/list.tsx';
import { Card, CardBody, CardHeader, CardTitle } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Counter from 'soapbox/components/ui/counter.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { useSettingsNotifications } from 'soapbox/hooks/useSettingsNotifications.ts';

import Preferences from '../preferences/index.tsx';

import MessagesSettings from './components/messages-settings.tsx';

const messages = defineMessages({
  accountAliases: { id: 'navigation_bar.account_aliases', defaultMessage: 'Account aliases' },
  accountMigration: { id: 'settings.account_migration', defaultMessage: 'Move Account' },
  backups: { id: 'column.backups', defaultMessage: 'Backups' },
  blocks: { id: 'settings.blocks', defaultMessage: 'Blocks' },
  changeEmail: { id: 'settings.change_email', defaultMessage: 'Change Email' },
  changePassword: { id: 'settings.change_password', defaultMessage: 'Change Password' },
  configureMfa: { id: 'settings.configure_mfa', defaultMessage: 'Configure MFA' },
  deleteAccount: { id: 'settings.delete_account', defaultMessage: 'Delete Account' },
  editProfile: { id: 'settings.edit_profile', defaultMessage: 'Edit Profile' },
  editIdentity: { id: 'settings.edit_identity', defaultMessage: 'Identity' },
  editRelays: { id: 'nostr_relays.title', defaultMessage: 'Relays' },
  exportData: { id: 'column.export_data', defaultMessage: 'Export data' },
  importData: { id: 'navigation_bar.import_data', defaultMessage: 'Import data' },
  mfaDisabled: { id: 'mfa.disabled', defaultMessage: 'Disabled' },
  mfaEnabled: { id: 'mfa.enabled', defaultMessage: 'Enabled' },
  mutes: { id: 'settings.mutes', defaultMessage: 'Mutes' },
  other: { id: 'settings.other', defaultMessage: 'Other Options' },
  preferences: { id: 'settings.preferences', defaultMessage: 'Preferences' },
  privacy: { id: 'settings.privacy', defaultMessage: 'Privacy' },
  profile: { id: 'settings.profile', defaultMessage: 'Profile' },
  security: { id: 'settings.security', defaultMessage: 'Security' },
  sessions: { id: 'settings.sessions', defaultMessage: 'Active sessions' },
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
});

/** User settings page. */
const Settings = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const mfa = useAppSelector((state) => state.security.get('mfa'));
  const features = useFeatures();
  const { account } = useOwnAccount();
  const { instance } = useInstance();
  const settingsNotifications = useSettingsNotifications();

  const isMfaEnabled = mfa.getIn(['settings', 'totp']);

  useEffect(() => {
    if (features.security) dispatch(fetchMfa());
  }, [dispatch]);

  if (!account) return null;

  const displayName = account.display_name || account.username;

  return (
    <Column label={intl.formatMessage(messages.settings)} transparent withHeader={false} slim>
      <Card className='space-y-4'>
        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.profile)} />
        </CardHeader>

        <CardBody>
          <List>
            <ListItem label={intl.formatMessage(messages.editProfile)} to='/settings/profile'>
              <span className='max-w-full truncate'>{displayName}</span>
            </ListItem>
            {features.nip05 && (
              <ListItem label={intl.formatMessage(messages.editIdentity)} to='/settings/identity'>
                <span className='max-w-full truncate'>
                  {account?.source?.nostr?.nip05}
                  {settingsNotifications.has('needsNip05') && <Counter count={1} />}
                </span>
              </ListItem>
            )}
            {features.nostr && <ListItem label={intl.formatMessage(messages.editRelays)} to='/settings/relays' />}
          </List>
        </CardBody>

        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.privacy)} />
        </CardHeader>

        <CardBody>
          <List>
            <ListItem label={intl.formatMessage(messages.mutes)} to='/mutes' />
            {features.blocks && (<ListItem label={intl.formatMessage(messages.blocks)} to='/blocks' />)}
          </List>
        </CardBody>

        {(features.security || features.sessions) && (
          <>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.security)} />
            </CardHeader>

            <CardBody>
              <List>
                {features.security && (
                  <>
                    <ListItem label={intl.formatMessage(messages.changeEmail)} to='/settings/email' />
                    <ListItem label={intl.formatMessage(messages.changePassword)} to='/settings/password' />
                    <ListItem label={intl.formatMessage(messages.configureMfa)} to='/settings/mfa'>
                      <span>
                        {isMfaEnabled ?
                          intl.formatMessage(messages.mfaEnabled) :
                          intl.formatMessage(messages.mfaDisabled)}
                      </span>
                    </ListItem>
                  </>
                )}
                {features.sessions && (
                  <ListItem label={intl.formatMessage(messages.sessions)} to='/settings/tokens' />
                )}
              </List>
            </CardBody>
          </>
        )}

        {features.chats ? (
          <>
            <CardHeader>
              <CardTitle title={<FormattedMessage id='column.chats' defaultMessage='Chats' />} />
            </CardHeader>

            <CardBody>
              <MessagesSettings />
            </CardBody>
          </>
        ) : null}

        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.preferences)} />
        </CardHeader>

        <CardBody>
          <Preferences />
        </CardBody>

        {(features.security || features.accountAliases) && (
          <>
            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.other)} />
            </CardHeader>

            <CardBody>
              <List>
                {features.importData && (
                  <ListItem label={intl.formatMessage(messages.importData)} to='/settings/import' />
                )}

                {features.exportData && (
                  <ListItem label={intl.formatMessage(messages.exportData)} to='/settings/export' />
                )}

                {features.backups && (
                  <ListItem label={intl.formatMessage(messages.backups)} to='/settings/backups' />
                )}

                {features.federating && (features.accountMoving ? (
                  <ListItem label={intl.formatMessage(messages.accountMigration)} to='/settings/migration' />
                ) : features.accountAliases && (
                  <ListItem label={intl.formatMessage(messages.accountAliases)} to='/settings/aliases' />
                ))}

                {features.security && (
                  <ListItem label={<Text theme='danger'>{intl.formatMessage(messages.deleteAccount)}</Text>} to='/settings/account' />
                )}
              </List>
            </CardBody>
          </>
        )}

        {instance.nostr && (
          <>
            <CardHeader>
              <CardTitle title={<FormattedMessage id='nostr_panel.title' defaultMessage='Nostr Relay' />} />
            </CardHeader>

            <CardBody className='pb-3'>
              <FormGroup hintText={<FormattedMessage id='nostr_panel.message' defaultMessage='Connect with any Nostr client.' />}>
                <CopyableInput value={instance.nostr.relay} />
              </FormGroup>
            </CardBody>
          </>
        )}
      </Card>
    </Column>
  );
};

export default Settings;
