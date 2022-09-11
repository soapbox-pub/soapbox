import React from 'react';
import { FormattedMessage } from 'react-intl';

import Account from 'soapbox/components/account';
import MissingIndicator from 'soapbox/components/missing_indicator';
import { Button, HStack, Modal, Stack } from 'soapbox/components/ui';
import { useAppSelector, useFeatures } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

const getAccount = makeGetAccount();

interface IAccountModerationModal {
  /** Action to close the modal. */
  onClose: (type: string) => void,
  /** ID of the account to moderate. */
  accountId: string,
}

/** Moderator actions against accounts. */
const AccountModerationModal: React.FC<IAccountModerationModal> = ({ onClose, accountId }) => {
  const features = useFeatures();
  const account = useAppSelector(state => getAccount(state, accountId));

  const handleClose = () => onClose('ACCOUNT_MODERATION');

  if (!account) {
    return (
      <Modal onClose={handleClose}>
        <MissingIndicator />
      </Modal>
    );
  }

  const handleAdminFE = () => {
    window.open(`/pleroma/admin/#/users/${account.id}/`, '_blank');
  };

  return (
    <Modal
      title={<FormattedMessage id='account_moderation_modal.title' defaultMessage='Moderate @{acct}' values={{ acct: account.acct }} />}
      onClose={handleClose}
    >
      <Stack space={4}>
        <div className='p-4 rounded-lg border border-solid border-gray-300 dark:border-gray-800'>
          <Account
            account={account}
            showProfileHoverCard={false}
            withLinkToProfile={false}
            hideActions
          />
        </div>

        {features.adminFE && (
          <HStack justifyContent='center'>
            <Button icon={require('@tabler/icons/external-link.svg')} size='sm' theme='secondary' onClick={handleAdminFE}>
              <FormattedMessage id='account_moderation_modal.admin_fe' defaultMessage='Open in AdminFE' />
            </Button>
          </HStack>
        )}
      </Stack>
    </Modal>
  );
};

export default AccountModerationModal;
