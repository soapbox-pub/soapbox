import React, { useState } from 'react';

import ExtensionStep from './steps/extension-step';
import KeyAddStep from './steps/key-add-step';

type Step = 'extension' | 'key-add';

interface INostrLoginModal {
  onClose: (type?: string) => void;
}

const NostrLoginModal: React.FC<INostrLoginModal> = ({ onClose }) => {
  const [step, setStep] = useState<Step>(window.nostr ? 'extension' : 'key-add');

  const handleClose = () => onClose('NOSTR_SIGNIN');

  switch (step) {
    case 'extension':
      return <ExtensionStep setStep={setStep} onClose={handleClose} />;
    case 'key-add':
      return <KeyAddStep onClose={handleClose} />;
    default:
      return null;
  }
};

export default NostrLoginModal;

export type { Step };
