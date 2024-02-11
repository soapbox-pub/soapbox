import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Modal, Stack } from 'soapbox/components/ui';

import ExtensionStep from './steps/extension-step';
import IdentityStep from './steps/identity-step';

interface INostrSigninModal {
  onClose: (type?: string) => void;
}

const NostrSigninModal: React.FC<INostrSigninModal> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const handleClose = () => {
    onClose('NOSTR_SIGNIN');
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return <ExtensionStep setStep={setStep} />;
      case 1:
        return <IdentityStep setStep={setStep} />;
    }
  };

  const renderModalTitle = () => {
    switch (step) {
      case 0:
        return <FormattedMessage id='nostr_signin.siwe.title' defaultMessage='Sign in with extension' />;
      case 1:
        return <FormattedMessage id='nostr_signin.identity.title' defaultMessage='Who are you?' />;
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
