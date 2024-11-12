import { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeEmail } from 'soapbox/actions/security.ts';
import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import FormActions from 'soapbox/components/ui/form-actions.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  header: { id: 'edit_email.header', defaultMessage: 'Change Email' },
  updateEmailSuccess: { id: 'security.update_email.success', defaultMessage: 'Email successfully updated.' },
  updateEmailFail: { id: 'security.update_email.fail', defaultMessage: 'Update email failed.' },
  emailFieldLabel: { id: 'security.fields.email.label', defaultMessage: 'Email address' },
  emailFieldPlaceholder: { id: 'edit_email.placeholder', defaultMessage: 'me@example.com' },
  passwordFieldLabel: { id: 'security.fields.password.label', defaultMessage: 'Password' },
  submit: { id: 'security.submit', defaultMessage: 'Save changes' },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
});

const initialState = { email: '', password: '' };

const EditEmail = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [state, setState] = useState(initialState);
  const [isLoading, setLoading] = useState(false);

  const { email, password } = state;

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    event.persist();

    setState((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  }, []);

  const handleSubmit = useCallback(() => {
    setLoading(true);
    dispatch(changeEmail(email, password)).then(() => {
      setState(initialState);
      toast.success(intl.formatMessage(messages.updateEmailSuccess));
    }).finally(() => {
      setLoading(false);
    }).catch(() => {
      setState((prevState) => ({ ...prevState, password: '' }));
      toast.error(intl.formatMessage(messages.updateEmailFail));
    });
  }, [email, password, dispatch, intl]);

  return (
    <Column label={intl.formatMessage(messages.header)} backHref='/settings'>
      <Form onSubmit={handleSubmit}>
        <FormGroup labelText={intl.formatMessage(messages.emailFieldLabel)}>
          <Input
            type='text'
            placeholder={intl.formatMessage(messages.emailFieldPlaceholder)}
            name='email'
            autoComplete='off'
            onChange={handleInputChange}
            value={email}
          />
        </FormGroup>

        <FormGroup labelText={intl.formatMessage(messages.passwordFieldLabel)}>
          <Input
            type='password'
            name='password'
            onChange={handleInputChange}
            value={password}
          />
        </FormGroup>

        <FormActions>
          <Button to='/settings' theme='tertiary'>{intl.formatMessage(messages.cancel)}</Button>
          <Button type='submit' theme='primary' disabled={isLoading}>{intl.formatMessage(messages.submit)}</Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export default EditEmail;
