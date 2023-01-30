import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { fetchMfa } from 'soapbox/actions/mfa';
import List, { ListItem } from 'soapbox/components/list';
import { Card, CardBody, CardHeader, CardTitle, Column } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useFeatures, useOwnAccount } from 'soapbox/hooks';

import Preferences from '../preferences';

import MessagesSettings from './components/messages-settings';

const messages = defineMessages({
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
  profile: { id: 'settings.profile', defaultMessage: 'Profile' },
  security: { id: 'settings.security', defaultMessage: 'Security' },
  preferences: { id: 'settings.preferences', defaultMessage: 'Preferences' },
  editProfile: { id: 'settings.edit_profile', defaultMessage: 'Edit Profile' },
  changeEmail: { id: 'settings.change_email', defaultMessage: 'Change Email' },
  changePassword: { id: 'settings.change_password', defaultMessage: 'Change Password' },
  configureMfa: { id: 'settings.configure_mfa', defaultMessage: 'Configure MFA' },
  sessions: { id: 'settings.sessions', defaultMessage: 'Active sessions' },
  deleteAccount: { id: 'settings.delete_account', defaultMessage: 'Delete Account' },
  accountMigration: { id: 'settings.account_migration', defaultMessage: 'Move Account' },
  accountAliases: { id: 'navigation_bar.account_aliases', defaultMessage: 'Account aliases' },
  other: { id: 'settings.other', defaultMessage: 'Other options' },
  mfaEnabled: { id: 'mfa.enabled', defaultMessage: 'Enabled' },
  mfaDisabled: { id: 'mfa.disabled', defaultMessage: 'Disabled' },
  backups: { id: 'column.backups', defaultMessage: 'Backups' },
  importData: { id: 'navigation_bar.import_data', defaultMessage: 'Import data' },
  exportData: { id: 'column.export_data', defaultMessage: 'Export data' },
});

/** User settings page. */
const Settings = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();

  const mfa = useAppSelector((state) => state.security.get('mfa'));
  const features = useFeatures();
  const account = useOwnAccount();

  const navigateToChangeEmail = () => history.push('/settings/email');
  const navigateToChangePassword = () => history.push('/settings/password');
  const navigateToMfa = () => history.push('/settings/mfa');
  const navigateToSessions = () => history.push('/settings/tokens');
  const navigateToEditProfile = () => history.push('/settings/profile');
  const navigateToDeleteAccount = () => history.push('/settings/account');
  const navigateToMoveAccount = () => history.push('/settings/migration');
  const navigateToAliases = () => history.push('/settings/aliases');
  const navigateToBackups = () => history.push('/settings/backups');
  const navigateToImportData = () => history.push('/settings/import');
  const navigateToExportData = () => history.push('/settings/export');

  const isMfaEnabled = mfa.getIn(['settings', 'totp']);

  useEffect(() => {
    if (features.security) dispatch(fetchMfa());
  }, [dispatch]);

  if (!account) return null;

  const displayName = account.display_name || account.username;

  return (
    <Column label={intl.formatMessage(messages.settings)} transparent withHeader={false}>
      <Card className='space-y-4' variant='rounded'>
        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.profile)} />
        </CardHeader>

        <CardBody>
          <List>
            <ListItem label={intl.formatMessage(messages.editProfile)} onClick={navigateToEditProfile}>
              <span>{displayName}</span>
            </ListItem>
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
                    <ListItem label={intl.formatMessage(messages.changeEmail)} onClick={navigateToChangeEmail} />
                    <ListItem label={intl.formatMessage(messages.changePassword)} onClick={navigateToChangePassword} />
                    <ListItem label={intl.formatMessage(messages.configureMfa)} onClick={navigateToMfa}>
                      <span>
                        {isMfaEnabled ?
                          intl.formatMessage(messages.mfaEnabled) :
                          intl.formatMessage(messages.mfaDisabled)}
                      </span>
                    </ListItem>
                  </>
                )}
                {features.sessions && (
                  <ListItem label={intl.formatMessage(messages.sessions)} onClick={navigateToSessions} />
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
                  <ListItem label={intl.formatMessage(messages.importData)} onClick={navigateToImportData} />
                )}

                {features.exportData && (
                  <ListItem label={intl.formatMessage(messages.exportData)} onClick={navigateToExportData} />
                )}

                {features.backups && (
                  <ListItem label={intl.formatMessage(messages.backups)} onClick={navigateToBackups} />
                )}

                {features.federating && (features.accountMoving ? (
                  <ListItem label={intl.formatMessage(messages.accountMigration)} onClick={navigateToMoveAccount} />
                ) : features.accountAliases && (
                  <ListItem label={intl.formatMessage(messages.accountAliases)} onClick={navigateToAliases} />
                ))}

                {features.security && (
                  <ListItem label={intl.formatMessage(messages.deleteAccount)} onClick={navigateToDeleteAccount} />
                )}
              </List>
            </CardBody>
          </>
        )}
      </Card>
    </Column>
  );
};

export default Settings;
