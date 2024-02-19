import { NostrSigner } from 'nspec';
import React, { useState } from 'react';

import AccountStep from './steps/account-step';
import ExtensionStep from './steps/extension-step';
import IdentityStep from './steps/identity-step';
import KeyStep from './steps/key-step';
import KeygenStep from './steps/keygen-step';
import RegisterStep from './steps/register-step';

interface INostrSigninModal {
  onClose: (type?: string) => void;
}

const NostrSigninModal: React.FC<INostrSigninModal> = ({ onClose }) => {
  const [step, setStep] = useState(window.nostr ? 0 : 1);

  const [, setSigner] = useState<NostrSigner | undefined>();
  const [accountId, setAccountId] = useState<string | undefined>();

  const handleClose = () => onClose('NOSTR_SIGNIN');

  switch (step) {
    case 0:
      return <ExtensionStep setStep={setStep} onClose={handleClose} />;
    case 1:
      return <IdentityStep setAccountId={setAccountId} setStep={setStep} onClose={handleClose} />;
    case 2:
      return <KeyStep setStep={setStep}  onClose={handleClose} />;
    case 3:
      return <AccountStep accountId={accountId!} setStep={setStep}  onClose={handleClose} />;
    case 4:
      return <RegisterStep onClose={handleClose} />;
    case 5:
      return <KeygenStep setSigner={setSigner} setStep={setStep} onClose={handleClose} />;
    default:
      return null;
  }
};

export default NostrSigninModal;
