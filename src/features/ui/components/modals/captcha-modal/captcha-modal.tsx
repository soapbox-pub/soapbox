import React from 'react';
import { FormattedMessage } from 'react-intl';

import { startOnboarding } from 'soapbox/actions/onboarding';
import { Modal, Stack } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';

import Captcha from './captcha';

interface ICaptchaModal {
  onClose: (type?: string) => void;
}

const CaptchaModal: React.FC<ICaptchaModal> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  return (
    <Modal
      title={<FormattedMessage id='nostr_signup.captcha_title' defaultMessage='Human Verification' />} onClose={() => {
        onClose();
        dispatch(startOnboarding());
      }} width='sm'
    >
      <Stack justifyContent='center' alignItems='center' space={4}>
        <Captcha />
      </Stack>
    </Modal>
  );
};

export default CaptchaModal;