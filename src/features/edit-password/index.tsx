import { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changePassword } from 'soapbox/actions/security.ts';
import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import FormActions from 'soapbox/components/ui/form-actions.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import { useAppDispatch } from 'soapbox/hooks/index.ts';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  updatePasswordSuccess: { id: 'security.update_password.success', defaultMessage: 'Password successfully updated.' },
  updatePasswordFail: { id: 'security.update_password.fail', defaultMessage: 'Update password failed.' },
  oldPasswordFieldLabel: { id: 'security.fields.old_password.label', defaultMessage: 'Current password' },
  newPasswordFieldLabel: { id: 'security.fields.new_password.label', defaultMessage: 'New password' },
  confirmationFieldLabel: { id: 'security.fields.password_confirmation.label', defaultMessage: 'New password (again)' },
  header: { id: 'edit_password.header', defaultMessage: 'Change Password' },
  submit: { id: 'security.submit', defaultMessage: 'Save changes' },
  cancel: { id: 'common.cancel', defaultMessage: 'Cancel' },
});

const initialState = { currentPassword: '', newPassword: '', newPasswordConfirmation: '' };

const EditPassword = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [state, setState] = useState(initialState);
  const [isLoading, setLoading] = useState(false);

  const { currentPassword, newPassword, newPasswordConfirmation } = state;

  const resetState = () => setState(initialState);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = useCallback((event) => {
    event.persist();

    setState((prevState) => ({ ...prevState, [event.target.name]: event.target.value }));
  }, []);

  const handleSubmit = useCallback(() => {
    setLoading(true);
    dispatch(changePassword(currentPassword, newPassword, newPasswordConfirmation)).then(() => {
      resetState();
      toast.success(intl.formatMessage(messages.updatePasswordSuccess));

    }).finally(() => {
      setLoading(false);
    }).catch(() => {
      resetState();
      toast.error(intl.formatMessage(messages.updatePasswordFail));
    });
  }, [currentPassword, newPassword, newPasswordConfirmation, dispatch, intl]);

  return (
    <Column label={intl.formatMessage(messages.header)} backHref='/settings'>
      <Form onSubmit={handleSubmit}>
        <FormGroup labelText={intl.formatMessage(messages.oldPasswordFieldLabel)}>
          <Input
            type='password'
            name='currentPassword'
            onChange={handleInputChange}
            value={currentPassword}
          />
        </FormGroup>

        <FormGroup labelText={intl.formatMessage(messages.newPasswordFieldLabel)}>
          <Input
            type='password'
            name='newPassword'
            onChange={handleInputChange}
            value={newPassword}
          />
        </FormGroup>

        <FormGroup labelText={intl.formatMessage(messages.confirmationFieldLabel)}>
          <Input
            type='password'
            name='newPasswordConfirmation'
            onChange={handleInputChange}
            value={newPasswordConfirmation}
          />
        </FormGroup>

        <FormActions>
          <Button to='/settings' theme='tertiary'>
            {intl.formatMessage(messages.cancel)}
          </Button>

          <Button type='submit' theme='primary' disabled={isLoading}>
            {intl.formatMessage(messages.submit)}
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

export default EditPassword;
