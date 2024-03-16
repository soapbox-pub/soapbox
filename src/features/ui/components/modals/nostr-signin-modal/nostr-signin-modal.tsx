import React, { useState } from 'react';

import ExtensionStep from './steps/extension-step';
import KeyStep from './steps/key-step';
import KeygenStep from './steps/keygen-step';

type Step = 'extension' | 'key' | 'keygen';

interface INostrSigninModal {
  onClose: (type?: string) => void;
}

const NostrSigninModal: React.FC<INostrSigninModal> = ({ onClose }) => {
  const [step, setStep] = useState<Step>(window.nostr ? 'extension' : 'key');

  const handleClose = () => onClose('NOSTR_SIGNIN');

  switch (step) {
    case 'extension':
      return <ExtensionStep setStep={setStep} onClose={handleClose} />;
    case 'key':
      return <KeyStep setStep={setStep} onClose={handleClose} />;
    case 'keygen':
      return <KeygenStep onClose={handleClose} />;
    default:
      return null;
  }
};

export default NostrSigninModal;

export type { Step };
