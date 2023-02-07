import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { moveAccount } from 'soapbox/actions/security';
import { Button, Column, Form, FormActions, FormGroup, Input, Text } from 'soapbox/components/ui';
import { useAppDispatch, useInstance } from 'soapbox/hooks';
import toast from 'soapbox/toast';

const messages = defineMessages({
  heading: { id: 'column.migration', defaultMessage: 'Account migration' },
  submit: { id: 'migration.submit', defaultMessage: 'Move followers' },
  moveAccountSuccess: { id: 'migration.move_account.success', defaultMessage: 'Account successfully moved.' },
  moveAccountFail: { id: 'migration.move_account.fail', defaultMessage: 'Account migration failed.' },
  moveAccountFailCooldownPeriod: { id: 'migration.move_account.fail.cooldown_period', defaultMessage: 'You have moved your account too recently. Please try again later.' },
  acctFieldLabel: { id: 'migration.fields.acct.label', defaultMessage: 'Handle of the new account' },
  acctFieldPlaceholder: { id: 'migration.fields.acct.placeholder', defaultMessage: 'username@domain' },
  currentPasswordFieldLabel: { id: 'migration.fields.confirm_password.label', defaultMessage: 'Current password' },
});

const Migration = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const instance = useInstance();

  const cooldownPeriod = instance.pleroma.getIn(['metadata', 'migration_cooldown_period']) as number | undefined;

  const [targetAccount, setTargetAccount] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = e => {
    if (e.target.name === 'password') setPassword(e.target.value);
    else setTargetAccount(e.target.value);
  };

  const clearForm = () => {
    setTargetAccount('');
    setPassword('');
  };

  const handleSubmit: React.FormEventHandler = e => {
    setIsLoading(true);
    return dispatch(moveAccount(targetAccount, password)).then(() => {
      clearForm();
      toast.success(intl.formatMessage(messages.moveAccountSuccess));
    }).catch(error => {
      let message = intl.formatMessage(messages.moveAccountFail);

      const errorMessage = (error.response?.data)?.error;
      if (errorMessage === 'You are within cooldown period.') {
        message = intl.formatMessage(messages.moveAccountFailCooldownPeriod);
      }

      toast.error(message);
    }).then(() => {
      setIsLoading(false);
    });
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Form onSubmit={handleSubmit}>
        <Text theme='muted'>
          <FormattedMessage
            id='migration.hint'
            defaultMessage='This will move your followers to the new account. No other data will be moved. To perform migration, you need to {link} on your new account first.'
            values={{
              link: (
                <Link
                  className='text-primary-600 hover:text-primary-800 hover:underline dark:text-primary-400 dark:hover:text-primary-500'
                  to='/settings/aliases'
                >
                  <FormattedMessage
                    id='migration.hint.link'
                    defaultMessage='create an account alias'
                  />
                </Link>
              ),
            }}
          />
          {!!cooldownPeriod && (<>
            {' '}
            <FormattedMessage
              id='migration.hint.cooldown_period'
              defaultMessage='If you migrate your account, you will not be able to migrate your account for {cooldownPeriod, plural, one {one day} other {the next # days}}.'
              values={{ cooldownPeriod }}
            />
          </>)}
        </Text>
        <FormGroup
          labelText={intl.formatMessage(messages.acctFieldLabel)}
        >
          <Input
            name='targetAccount'
            placeholder={intl.formatMessage(messages.acctFieldPlaceholder)}
            onChange={handleInputChange}
            value={targetAccount}
            required
          />
        </FormGroup>
        <FormGroup
          labelText={intl.formatMessage(messages.currentPasswordFieldLabel)}
        >
          <Input
            type='password'
            name='password'
            onChange={handleInputChange}
            value={password}
            required
          />
        </FormGroup>
        <FormActions>
          <Button
            theme='primary'
            text={intl.formatMessage(messages.submit)}
            onClick={handleSubmit}
            disabled={isLoading}
          />
        </FormActions>
      </Form>
    </Column>
  );
};

export default Migration;
