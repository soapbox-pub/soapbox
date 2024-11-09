import { useState } from 'react';

import ExtensionStep from './steps/extension-step';
import KeyAddStep from './steps/key-add-step';

type Step = 'extension' | 'key-add';

interface INostrLoginModal {
  onClose: (type?: string) => void;
  step?: Step;
}

const NostrLoginModal: React.FC<INostrLoginModal> = ({ onClose, step: firstStep }) => {
  const [step, setStep] = useState<Step>(firstStep ?? (window.nostr ? 'extension' : 'key-add'));

  const handleClose = () => onClose('NOSTR_LOGIN');

  switch (step) {
    case 'extension':
      return <ExtensionStep onClickAlt={() => setStep('key-add')} onClose={handleClose} isLogin />;
    case 'key-add':
      return <KeyAddStep onClose={handleClose} />;
    default:
      return null;
  }
};

export default NostrLoginModal;

export type { Step };
