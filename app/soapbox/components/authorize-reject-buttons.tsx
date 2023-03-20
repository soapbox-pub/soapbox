import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Button, HStack } from 'soapbox/components/ui';

const messages = defineMessages({
  authorize: { id: 'authorize', defaultMessage: 'Accept' },
  authorized: { id: 'authorize.success', defaultMessage: 'Accepted' },
  reject: { id: 'reject', defaultMessage: 'Reject' },
  rejected: { id: 'reject.success', defaultMessage: 'Rejected' },
});

interface IAuthorizeRejectButtons {
  id: string
  onAuthorize(id: string): Promise<unknown>
  onReject(id: string): Promise<unknown>
}

/** Buttons to approve or reject a pending item, usually an account. */
const AuthorizeRejectButtons: React.FC<IAuthorizeRejectButtons> = ({ id, onAuthorize, onReject }) => {
  const intl = useIntl();
  const [state, setState] = useState<'authorized' | 'rejected' | 'pending'>('pending');

  function handleAuthorize() {
    onAuthorize(id)
      .then(() => setState('authorized'))
      .catch(console.error);
  }

  function handleReject() {
    onReject(id)
      .then(() => setState('rejected'))
      .catch(console.error);
  }

  switch (state) {
    case 'pending':
      return (
        <HStack space={2}>
          <Button
            theme='secondary'
            size='sm'
            text={intl.formatMessage(messages.authorize)}
            onClick={handleAuthorize}
          />
          <Button
            theme='danger'
            size='sm'
            text={intl.formatMessage(messages.reject)}
            onClick={handleReject}
          />
        </HStack>
      );
    case 'authorized':
      return (
        <Button
          size='sm'
          text={intl.formatMessage(messages.authorized)}
          disabled
        />
      );
    case 'rejected':
      return (
        <Button
          size='sm'
          text={intl.formatMessage(messages.rejected)}
          disabled
        />
      );
  }
};

export { AuthorizeRejectButtons };