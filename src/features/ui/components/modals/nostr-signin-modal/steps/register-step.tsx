import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Stack, Modal } from 'soapbox/components/ui';

interface IRegisterStep {
  onClose(): void;
}

const RegisterStep: React.FC<IRegisterStep> = ({ onClose }) => {
  return (
    <Modal title={<FormattedMessage id='nostr_signin.register.title' defaultMessage='Create account' />} onClose={onClose}>
      <Stack space={3}>
        register step
      </Stack>
    </Modal>
  );
};

export default RegisterStep;
