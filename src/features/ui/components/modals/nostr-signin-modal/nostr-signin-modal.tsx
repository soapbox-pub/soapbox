import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Modal, Stack } from 'soapbox/components/ui';

import AccountStep from './steps/account-step';
import ExtensionStep from './steps/extension-step';
import IdentityStep from './steps/identity-step';
import KeyStep from './steps/key-step';
import RegisterStep from './steps/register-step';

interface INostrSigninModal {
  onClose: (type?: string) => void;
}

const NostrSigninModal: React.FC<INostrSigninModal> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const [accountId, setAccountId] = useState<string | undefined>();

  const handleClose = () => {
    onClose('NOSTR_SIGNIN');
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <ExtensionStep setStep={setStep} />;
      case 1:
        return <IdentityStep setAccountId={setAccountId} setStep={setStep} />;
      case 2:
        return <KeyStep setStep={setStep} />;
      case 3:
        return <AccountStep accountId={accountId!} />;
      case 4:
        return <RegisterStep />;
    }
  };

  const renderModalTitle = () => {
    switch (step) {
      case 0:
        return <FormattedMessage id='nostr_signin.siwe.title' defaultMessage='Sign in' />;
      case 1:
        return <FormattedMessage id='nostr_signin.identity.title' defaultMessage='Who are you?' />;
      case 2:
        return <FormattedMessage id='nostr_signin.key.title' defaultMessage='You need a key to continue' />;
      case 3:
        return <FormattedMessage id='nostr_signin.account.title' defaultMessage='Create an account' />;
      default:
        return null;
    }
  };

  return (
    <Modal
      title={renderModalTitle()}
      onClose={handleClose}
    >
      <Stack space={2}>
        {renderStep()}
      </Stack>
    </Modal>
  );
};

export default NostrSigninModal;
