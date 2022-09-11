import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import MissingIndicator from 'soapbox/components/missing_indicator';
import {  Modal } from 'soapbox/components/ui';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetAccount } from 'soapbox/selectors';

const messages = defineMessages({
  title: { id: 'account_moderation_modal.title', defaultMessage: 'Moderate @{acct}' },
});

const getAccount = makeGetAccount();

interface IAccountModerationModal {
  /** Action to close the modal. */
  onClose: (type: string) => void,
  /** ID of the account to moderate. */
  accountId: string,
}

/** Moderator actions against accounts. */
const AccountModerationModal: React.FC<IAccountModerationModal> = ({ onClose, accountId }) => {
  const intl = useIntl();
  const account = useAppSelector(state => getAccount(state, accountId));

  const handleClose = () => onClose('ACCOUNT_MODERATION');

  if (!account) {
    return (
      <Modal onClose={handleClose}>
        <MissingIndicator />
      </Modal>
    );
  }

  return (
    <Modal
      title={intl.formatMessage(messages.title, { acct: account.acct })}
      onClose={handleClose}
    >
      <div>TODO</div>
    </Modal>
  );
};

export default AccountModerationModal;
