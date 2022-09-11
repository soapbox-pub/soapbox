import React from 'react';
import { FormattedMessage } from 'react-intl';

import MissingIndicator from 'soapbox/components/missing_indicator';
import {  Button, HStack, Modal } from 'soapbox/components/ui';
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
      {features.adminFE && (
        <HStack justifyContent='center'>
          <Button icon={require('@tabler/icons/external-link.svg')} size='sm' theme='secondary' onClick={handleAdminFE}>
            <FormattedMessage id='account_moderation_modal.admin_fe' defaultMessage='Open in AdminFE' />
          </Button>
        </HStack>
      )}
    </Modal>
  );
};

export default AccountModerationModal;
