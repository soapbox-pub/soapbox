import { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { fetchMfa } from 'soapbox/actions/mfa.ts';
import List, { ListItem } from 'soapbox/components/list.tsx';
import { Card, CardBody, CardHeader, CardTitle } from 'soapbox/components/ui/card.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Balance from 'soapbox/features/my-wallet/components/balance.tsx';
import CreateWallet from 'soapbox/features/my-wallet/components/create-wallet.tsx';
import Transactions from 'soapbox/features/my-wallet/components/transactions.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';


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
  transactions: { id: 'my_wallet.transactions', defaultMessage: 'Transactions' },
  myWallet: { id: 'my_wallet.my_wallet', defaultMessage: 'My Wallet' },
  security: { id: 'settings.security', defaultMessage: 'Security' },
  sessions: { id: 'settings.sessions', defaultMessage: 'Active sessions' },
  settings: { id: 'settings.settings', defaultMessage: 'Settings' },
});

/** User settings page. */
const MyWallet = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const features = useFeatures();
  const { account } = useOwnAccount();

  useEffect(() => {
    if (features.security) dispatch(fetchMfa());
  }, [dispatch]);

  if (!account) return null;

  const hasWallet = false;

  return (
    <Column label={intl.formatMessage(messages.settings)} transparent withHeader={false} slim>
      <Card className='space-y-4'>
        <CardHeader>
          <CardTitle title={intl.formatMessage(messages.myWallet)} />
        </CardHeader>

        {hasWallet ? (
          <>
            <CardBody>
              <Balance />
            </CardBody>

            <CardHeader>
              <CardTitle title={intl.formatMessage(messages.transactions)} />
            </CardHeader>

            <CardBody>
              <Transactions />
            </CardBody>

            <CardHeader>
              <CardTitle title={'Wallet Management'} />
            </CardHeader>

            <CardBody>
              <List>
                <ListItem label={'Mints'} to='/settings/profile' />
                <ListItem label={intl.formatMessage(messages.editRelays)} to='/settings/relays' />
              </List>
            </CardBody>

          </>
        )
          :
          <>
            <CardBody>
              <CreateWallet />
            </CardBody>

          </>
        }
      </Card>
    </Column>
  );
};

export default MyWallet;