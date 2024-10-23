import React from 'react';
import { FormattedMessage } from 'react-intl';

import useCaptcha from 'soapbox/api/hooks/captcha/useCaptcha';
import { Modal, Button, Spinner, Stack, Text } from 'soapbox/components/ui';

import { PuzzleCaptcha } from './components/puzzle';

interface ICaptchaModal {
  onClose: (type?: string) => void;
}

const CaptchaModal: React.FC<ICaptchaModal> = ({ onClose }) => {
  const {
    captcha,
    loadCaptcha,
    handleChangePosition,
    handleSubmit,
    isSubmitting,
    tryAgain,
    yPosition,
    xPosition,
  } = useCaptcha();

  const messageButton = tryAgain ? <FormattedMessage id='nostr_signup.captcha_try_again_button' defaultMessage='Try again' /> : <FormattedMessage id='nostr_signup.captcha_check_button' defaultMessage='Check' />;

  return (
    <Modal
      title={<FormattedMessage id='nostr_signup.captcha_title' defaultMessage='Human Verification' />} width='sm'
    >
      <Stack justifyContent='center' alignItems='center' space={4}>
        <Stack space={2} justifyContent='center' alignItems='center'>
          <Text align='center'>
            <FormattedMessage id='nostr_signup.captcha_instruction' defaultMessage='Complete the puzzle by dragging the puzzle piece to the correct position.' />
          </Text>

          <div className='relative flex min-h-[358px] min-w-[330px] items-center justify-center'>
            {captcha ? <PuzzleCaptcha bg={captcha.bg} puzzle={captcha.puzzle} position={{ x: xPosition!, y: yPosition! }} onChange={handleChangePosition} /> : <Spinner size={40} withText={false} />}
          </div>

          <Stack className='w-[330px]' space={2}>
            <Button
              block
              theme='primary'
              type='button'
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <FormattedMessage id='nostr_signup.captcha_check_button.checking' defaultMessage='Checking…' />
              ) : messageButton}
            </Button>
            <Button onClick={loadCaptcha}>
              <FormattedMessage id='nostr_signup.captcha_reset_button' defaultMessage='Reset puzzle' />
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Modal>
  );
};

export default CaptchaModal;