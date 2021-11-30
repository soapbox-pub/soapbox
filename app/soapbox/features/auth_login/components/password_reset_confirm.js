import React from 'react';
import { connect } from 'react-redux';
import ImmutablePureComponent from 'react-immutable-pure-component';
import { defineMessages, FormattedMessage, injectIntl } from 'react-intl';
import { resetPasswordConfirm } from 'soapbox/actions/security';
import { SimpleForm, FieldsGroup, SimpleInput } from 'soapbox/features/forms';
import { Redirect } from 'react-router-dom';
import snackbar from 'soapbox/actions/snackbar';

const messages = defineMessages({
  newPassword: { id: 'password_reset_confirm.fields.new_password_label', defaultMessage: 'New password' },
  confirmation: { id: 'password_reset_confirm.confirmation', defaultMessage: 'Your password has been updated' },
});

export default @connect()
@injectIntl
class PasswordResetConfirm extends ImmutablePureComponent {

  state = {
    isLoading: false,
    success: false,
    password: '',
  }

  handleSubmit = e => {
    const { dispatch, intl } = this.props;
    const { password } = this.state;
    const token = new URLSearchParams(window.location.search).get('reset_password_token');

    this.setState({ isLoading: true });
    dispatch(resetPasswordConfirm(password, token)).then(() => {
      this.setState({ success: true });
      dispatch(snackbar.info(intl.formatMessage(messages.confirmation)));
    }).catch(error => {
      this.setState({ isLoading: false });
    });
  }

  handlePasswordChange = ({ target }) => {
    this.setState({ password: target.value });
  }

  render() {
    const { intl } = this.props;
    const { password, success } = this.state;

    if (success) return <Redirect to='/' />;

    return (
      <SimpleForm onSubmit={this.handleSubmit}>
        <fieldset disabled={this.state.isLoading}>
          <FieldsGroup>
            <SimpleInput
              type='password'
              name='password'
              onChange={this.handlePasswordChange}
              label={intl.formatMessage(messages.newPassword)}
              value={password}
              required
            />
          </FieldsGroup>
        </fieldset>
        <div className='actions'>
          <button name='button' type='submit' className='btn button button-primary'>
            <FormattedMessage id='password_reset_confirm.submit' defaultMessage='Update password' />
          </button>
        </div>
      </SimpleForm>
    );
  }

}
