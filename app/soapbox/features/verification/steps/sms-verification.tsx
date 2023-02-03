import { AxiosError } from 'axios';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import OtpInput from 'react-otp-input';

import { confirmPhoneVerification, requestPhoneVerification } from 'soapbox/actions/verification';
import { Button, Form, FormGroup, PhoneInput, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import toast from 'soapbox/toast';

const messages = defineMessages({
  verificationInvalid: { id: 'sms_verification.invalid', defaultMessage: 'Please enter a valid phone number.' },
  verificationSuccess: { id: 'sms_verification.success', defaultMessage: 'A verification code has been sent to your phone number.' },
  verificationFail: { id: 'sms_verification.fail', defaultMessage: 'Failed to send SMS message to your phone number.' },
  verificationExpired: { id: 'sms_verification.expired', defaultMessage: 'Your SMS token has expired.' },
  phoneLabel: { id: 'sms_verification.phone.label', defaultMessage: 'Phone number' },
});

const Statuses = {
  IDLE: 'IDLE',
  REQUESTED: 'REQUESTED',
  FAIL: 'FAIL',
};

const SmsVerification = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector((state) => state.verification.isLoading) as boolean;

  const [phone, setPhone] = React.useState<string>();
  const [status, setStatus] = React.useState(Statuses.IDLE);
  const [verificationCode, setVerificationCode] = React.useState('');
  const [requestedAnother, setAlreadyRequestedAnother] = React.useState(false);

  const isValid = !!phone;

  const onChange = React.useCallback((phone?: string) => {
    setPhone(phone);
  }, []);

  const handleSubmit: React.FormEventHandler = React.useCallback((event) => {
    event.preventDefault();

    if (!isValid) {
      setStatus(Statuses.IDLE);
      toast.error(intl.formatMessage(messages.verificationInvalid));
      return;
    }

    dispatch(requestPhoneVerification(phone!)).then(() => {
      toast.success(intl.formatMessage(messages.verificationSuccess));
      setStatus(Statuses.REQUESTED);
    }).catch((error: AxiosError) => {
      const message = (error.response?.data as any)?.message || intl.formatMessage(messages.verificationFail);

      toast.error(message);
      setStatus(Statuses.FAIL);
    });
  }, [phone, isValid]);

  const resendVerificationCode: React.MouseEventHandler = React.useCallback((event) => {
    setAlreadyRequestedAnother(true);
    handleSubmit(event);
  }, [isValid]);

  const submitVerification = () => {
    // TODO: handle proper validation from Pepe -- expired vs invalid
    dispatch(confirmPhoneVerification(verificationCode))
      .catch(() => {
        toast.error(intl.formatMessage(messages.verificationExpired));
      });
  };

  React.useEffect(() => {
    if (verificationCode.length === 6) {
      submitVerification();
    }
  }, [verificationCode]);

  if (status === Statuses.REQUESTED) {
    return (
      <div>
        <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
          <h1 className='text-center text-2xl font-bold'>
            <FormattedMessage id='sms_verification.sent.header' defaultMessage='Verification code' />
          </h1>
        </div>

        <div className='mx-auto space-y-4 sm:w-2/3 sm:pt-10 md:w-1/2'>
          <Text theme='muted' size='sm' align='center'>
            <FormattedMessage id='sms_verification.sent.body' defaultMessage='We sent you a 6-digit code via SMS. Enter it below.' />
          </Text>

          <OtpInput
            value={verificationCode}
            onChange={setVerificationCode}
            numInputs={6}
            isInputNum
            shouldAutoFocus
            isDisabled={isLoading}
            containerStyle='flex justify-center mt-2 space-x-4'
            inputStyle='w-10i border-gray-300 dark:bg-gray-800 dark:border-gray-800 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
          />

          <div className='text-center'>
            <Button
              size='sm'
              type='button'
              theme='tertiary'
              onClick={resendVerificationCode}
              disabled={requestedAnother}
            >
              <FormattedMessage id='sms_verification.sent.actions.resend' defaultMessage='Resend verification code?' />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
        <h1 className='text-center text-2xl font-bold'>
          <FormattedMessage id='sms_verification.header' defaultMessage='Enter your phone number' />
        </h1>
      </div>

      <div className='mx-auto sm:w-2/3 sm:pt-10 md:w-1/2'>
        <Form onSubmit={handleSubmit}>
          <FormGroup labelText={intl.formatMessage(messages.phoneLabel)}>
            <PhoneInput
              value={phone}
              onChange={onChange}
              required
            />
          </FormGroup>

          <div className='text-center'>
            <Button block theme='primary' type='submit' disabled={isLoading || !isValid}>
              <FormattedMessage id='onboarding.next' defaultMessage='Next' />
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export { SmsVerification as default };
