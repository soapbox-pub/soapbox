import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { verifyAge } from 'soapbox/actions/verification';
import { Button, Datepicker, Form, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useInstance } from 'soapbox/hooks';
import toast from 'soapbox/toast';

const messages = defineMessages({
  fail: {
    id: 'age_verification.fail',
    defaultMessage: 'You must be {ageMinimum, plural, one {# year} other {# years}} old or older.',
  },
});

function meetsAgeMinimum(birthday: Date, ageMinimum: number) {
  const month = birthday.getUTCMonth();
  const day = birthday.getUTCDate();
  const year = birthday.getUTCFullYear();

  return new Date(year + ageMinimum, month, day) <= new Date();
}

const AgeVerification = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const instance = useInstance();

  const isLoading = useAppSelector((state) => state.verification.isLoading) as boolean;
  const ageMinimum = useAppSelector((state) => state.verification.ageMinimum) as any;

  const [date, setDate] = React.useState<Date>();
  const isValid = typeof date === 'object';

  const onChange = React.useCallback((date: Date) => setDate(date), []);

  const handleSubmit: React.FormEventHandler = React.useCallback((event) => {
    event.preventDefault();

    const birthday = new Date(date!);

    if (meetsAgeMinimum(birthday, ageMinimum)) {
      dispatch(verifyAge(birthday));
    } else {
      toast.error(intl.formatMessage(messages.fail, { ageMinimum }));
    }
  }, [date, ageMinimum]);

  return (
    <div>
      <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
        <h1 className='text-center text-2xl font-bold'>
          <FormattedMessage id='age_verification.header' defaultMessage='Enter your birth date' />
        </h1>
      </div>

      <div className='mx-auto sm:pt-10 md:w-2/3'>
        <Form onSubmit={handleSubmit}>
          <Datepicker onChange={onChange} />

          <Text theme='muted' size='sm'>
            <FormattedMessage
              id='age_verification.body'
              defaultMessage='{siteTitle} requires users to be at least {ageMinimum, plural, one {# year} other {# years}} old to access its platform. Anyone under the age of {ageMinimum, plural, one {# year} other {# years}} old cannot access this platform.'
              values={{
                siteTitle: instance.title,
                ageMinimum,
              }}
            />

          </Text>

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

export default AgeVerification;
