import { QRCodeCanvas as QRCode } from 'qrcode.react';
import { useCallback, useEffect, useState } from 'react';
import { useIntl, FormattedMessage, defineMessages } from 'react-intl';
import { useHistory } from 'react-router-dom';

import {
  setupMfa,
  confirmMfa,
} from 'soapbox/actions/mfa.ts';
import Button from 'soapbox/components/ui/button.tsx';
import FormActions from 'soapbox/components/ui/form-actions.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  mfaCancelButton: { id: 'column.mfa_cancel', defaultMessage: 'Cancel' },
  mfaSetupConfirmButton: { id: 'column.mfa_confirm_button', defaultMessage: 'Confirm' },
  confirmFail: { id: 'security.confirm.fail', defaultMessage: 'Incorrect code or password. Try again.' },
  qrFail: { id: 'security.qr.fail', defaultMessage: 'Failed to fetch setup key' },
  mfaConfirmSuccess: { id: 'mfa.confirm.success_message', defaultMessage: 'MFA confirmed' },
  codePlaceholder: { id: 'mfa.mfa_setup.code_placeholder', defaultMessage: 'Code' },
  passwordPlaceholder: { id: 'mfa.mfa_setup.password_placeholder', defaultMessage: 'Password' },
});

const OtpConfirmForm: React.FC = () => {
  const intl = useIntl();
  const history = useHistory();
  const dispatch = useAppDispatch();

  const [state, setState] = useState<{ password: string; isLoading: boolean; code: string; qrCodeURI: string; confirmKey: string }>({
    password: '',
    isLoading: false,
    code: '',
    qrCodeURI: '',
    confirmKey: '',
  });

  useEffect(() => {
    dispatch(setupMfa('totp')).then((data: any) => {
      setState((prevState) => ({ ...prevState, qrCodeURI: data.provisioning_uri, confirmKey: data.key }));
    }).catch(() => {
      toast.error(intl.formatMessage(messages.qrFail));
    });
  }, []);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    event.persist();

    setState((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    setState((prevState) => ({ ...prevState, isLoading: true }));

    dispatch(confirmMfa('totp', state.code, state.password) as any).then((r: any) => {
      toast.success(intl.formatMessage(messages.mfaConfirmSuccess));
      history.push('../auth/edit');
    }).catch(() => {
      toast.error(intl.formatMessage(messages.confirmFail));
      setState((prevState) => ({ ...prevState, isLoading: false }));
    });

    e.preventDefault();
  };

  return (
    <Stack space={4}>
      <Form onSubmit={handleSubmit}>
        <Stack>
          {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
          <Text weight='semibold' size='lg'>
            1. <FormattedMessage id='mfa.mfa_setup_scan_title' defaultMessage='Scan' />
          </Text>

          <Text theme='muted'>
            <FormattedMessage id='mfa.mfa_setup_scan_description' defaultMessage='Using your two-factor app, scan this QR code or enter the text key.' />
          </Text>
        </Stack>

        <QRCode className='rounded-lg' value={state.qrCodeURI} includeMargin />
        {state.confirmKey}

        {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
        <Text weight='semibold' size='lg'>
          2. <FormattedMessage id='mfa.mfa_setup_verify_title' defaultMessage='Verify' />
        </Text>

        <FormGroup
          labelText={intl.formatMessage(messages.codePlaceholder)}
          hintText={<FormattedMessage id='mfa.mfa_setup.code_hint' defaultMessage='Enter the code from your two-factor app.' />}
        >
          <Input
            name='code'
            placeholder={intl.formatMessage(messages.codePlaceholder)}
            onChange={handleInputChange}
            autoComplete='off'
            disabled={state.isLoading}
            value={state.code}
            type='text'
            required
          />
        </FormGroup>

        <FormGroup
          labelText={intl.formatMessage(messages.passwordPlaceholder)}
          hintText={<FormattedMessage id='mfa.mfa_setup.password_hint' defaultMessage='Enter your current password to confirm your identity.' />}
        >
          <Input
            type='password'
            name='password'
            placeholder={intl.formatMessage(messages.passwordPlaceholder)}
            onChange={handleInputChange}
            disabled={state.isLoading}
            value={state.password}
            required
          />
        </FormGroup>

        <FormActions>
          <Button
            type='button'
            theme='tertiary'
            text={intl.formatMessage(messages.mfaCancelButton)}
            onClick={() => history.push('../auth/edit')}
            disabled={state.isLoading}
          />

          <Button
            type='submit'
            theme='primary'
            text={intl.formatMessage(messages.mfaSetupConfirmButton)}
            disabled={state.isLoading}
          />
        </FormActions>
      </Form>
    </Stack>
  );
};

export default OtpConfirmForm;
