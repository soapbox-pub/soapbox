import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Modal, Stack } from 'soapbox/components/ui';

import Captcha from './captcha';

interface ICaptchaModal {
  onClose: (type?: string) => void;
}

const CaptchaModal: React.FC<ICaptchaModal> = ({ onClose }) => {
  return (
    <Modal title={<FormattedMessage id='nostr_signup.captcha_title' defaultMessage='Human Verification' />} onClose={onClose} width='sm'>
      <Stack justifyContent='center' alignItems='center' space={4}>
        <Captcha />
      </Stack>
    </Modal>
  );
};

export default CaptchaModal;