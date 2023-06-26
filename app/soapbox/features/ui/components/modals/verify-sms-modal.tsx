import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import OtpInput from 'react-otp-input';

import { verifyCredentials } from 'soapbox/actions/auth';
import { closeModal } from 'soapbox/actions/modals';
import { reConfirmPhoneVerification, reRequestPhoneVerification } from 'soapbox/actions/verification';
import { FormGroup, PhoneInput, Modal, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useInstance } from 'soapbox/hooks';
import toast from 'soapbox/toast';
import { getAccessToken } from 'soapbox/utils/auth';

const messages = defineMessages({
  verificationInvalid: {
    id: 'sms_verification.invalid',
    defaultMessage: 'Please enter a valid phone number.',
  },
  verificationSuccess: {
    id: 'sms_verification.success',
    defaultMessage: 'A verification code has been sent to your phone number.',
  },
  verificationFail: {
    id: 'sms_verification.fail',
    defaultMessage: 'Failed to send SMS message to your phone number.',
  },
  verificationExpired: {
    id: 'sms_verification.expired',
    defaultMessage: 'Your SMS token has expired.',
  },
  verifySms: {
    id: 'sms_verification.modal.verify_sms',
    defaultMessage: 'Verify SMS',
  },
  verifyNumber: {
    id: 'sms_verification.modal.verify_number',
    defaultMessage: 'Verify phone number',
  },
  verifyCode: {
    id: 'sms_verification.modal.verify_code',
    defaultMessage: 'Verify code',
  },
});

interface IVerifySmsModal {
  onClose: (type: string) => void
}

enum Statuses {
  IDLE = 'IDLE',
  READY = 'READY',
  REQUESTED = 'REQUESTED',
  FAIL = 'FAIL',
  SUCCESS = 'SUCCESS',
}

const VerifySmsModal: React.FC<IVerifySmsModal> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const instance = useInstance();
  const accessToken = useAppSelector((state) => getAccessToken(state));
  const isLoading = useAppSelector((state) => state.verification.isLoading);

  const [status, setStatus] = useState<Statuses>(Statuses.IDLE);
  const [phone, setPhone] = useState<string>();
  const [verificationCode, setVerificationCode] = useState('');
  const [requestedAnother, setAlreadyRequestedAnother] = useState(false);

  const isValid = !!phone;

  const onChange = useCallback((phone?: string) => {
    setPhone(phone);
  }, []);

  const handleSubmit = (event: React.MouseEvent) => {
    event.preventDefault();

    if (!isValid) {
      setStatus(Statuses.IDLE);
      toast.error(intl.formatMessage(messages.verificationInvalid));
      return;
    }

    dispatch(reRequestPhoneVerification(phone!)).then(() => {
      toast.success(
        intl.formatMessage(messages.verificationSuccess),
      );
    })
      .finally(() => setStatus(Statuses.REQUESTED))
      .catch(() => {
        toast.error(intl.formatMessage(messages.verificationFail));
      });
  };

  const resendVerificationCode = (event?: React.MouseEvent<HTMLButtonElement>) => {
    setAlreadyRequestedAnother(true);
    handleSubmit(event as React.MouseEvent<HTMLButtonElement>);
  };

  const onConfirmationClick = (event: any) => {
    switch (status) {
      case Statuses.IDLE:
        setStatus(Statuses.READY);
        break;
      case Statuses.READY:
        handleSubmit(event);
        break;
      case Statuses.REQUESTED:
        submitVerification();
        break;
      default: break;
    }
  };

  const confirmationText = useMemo(() => {
    switch (status) {
      case Statuses.IDLE:
        return intl.formatMessage(messages.verifySms);
      case Statuses.READY:
        return intl.formatMessage(messages.verifyNumber);
      case Statuses.REQUESTED:
        return intl.formatMessage(messages.verifyCode);
      default:
        return null;
    }
  }, [status]);

  const renderModalBody = () => {
    switch (status) {
      case Statuses.IDLE:
        return (
          <Text theme='muted'>
            <FormattedMessage
              id='sms_verification.modal.verify_help_text'
              defaultMessage='Verify your phone number to start using {instance}.'
              values={{
                instance: instance.title,
              }}
            />
          </Text>
        );
      case Statuses.READY:
        return (
          <FormGroup labelText={<FormattedMessage id='sms_verification.phone.label' defaultMessage='Phone number' />}>
            <PhoneInput
              value={phone}
              onChange={onChange}
              required
              autoFocus
            />
          </FormGroup>
        );
      case Statuses.REQUESTED:
        return (
          <>
            <Text theme='muted' size='sm' align='center'>
              <FormattedMessage
                id='sms_verification.modal.enter_code'
                defaultMessage='We sent you a 6-digit code via SMS. Enter it below.'
              />
            </Text>

            <OtpInput
              value={verificationCode}
              onChange={setVerificationCode}
              numInputs={6}
              isInputNum
              shouldAutoFocus
              isDisabled={isLoading}
              containerStyle='flex justify-center mt-2 space-x-4'
              inputStyle='w-10i border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500'
            />
          </>
        );
      default:
        return null;
    }
  };

  const submitVerification = () => {
    if (!accessToken) return;
    // TODO: handle proper validation from Pepe -- expired vs invalid
    dispatch(reConfirmPhoneVerification(verificationCode))
      .then(() => {
        setStatus(Statuses.SUCCESS);
        // eslint-disable-next-line promise/catch-or-return
        dispatch(verifyCredentials(accessToken))
          .then(() => dispatch(closeModal('VERIFY_SMS')));

      })
      .catch(() => toast.error(intl.formatMessage(messages.verificationExpired)));
  };

  useEffect(() => {
    if (verificationCode.length === 6) {
      submitVerification();
    }
  }, [verificationCode]);

  return (
    <Modal
      title={
        <FormattedMessage
          id='sms_verification.modal.verify_title'
          defaultMessage='Verify your phone number'
        />
      }
      onClose={() => onClose('VERIFY_SMS')}
      cancelAction={status === Statuses.IDLE ? () => onClose('VERIFY_SMS') : undefined}
      cancelText='Skip for now'
      confirmationAction={onConfirmationClick}
      confirmationText={confirmationText}
      secondaryAction={status === Statuses.REQUESTED ? resendVerificationCode : undefined}
      secondaryText={status === Statuses.REQUESTED ? (
        <FormattedMessage
          id='sms_verification.modal.resend_code'
          defaultMessage='Resend verification code?'
        />
      ) : undefined}
      secondaryDisabled={requestedAnother}
    >
      <Stack space={4}>
        {renderModalBody()}
      </Stack>
    </Modal>
  );
};

export default VerifySmsModal;
