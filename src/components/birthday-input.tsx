import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { useInstance, useFeatures } from 'soapbox/hooks';

import { Datetime } from './ui/datetime/datetime';

const messages = defineMessages({
  birthdayPlaceholder: { id: 'edit_profile.fields.birthday_placeholder', defaultMessage: 'Your birthday' },
  previousMonth: { id: 'datepicker.previous_month', defaultMessage: 'Previous month' },
  nextMonth: { id: 'datepicker.next_month', defaultMessage: 'Next month' },
  previousYear: { id: 'datepicker.previous_year', defaultMessage: 'Previous year' },
  nextYear: { id: 'datepicker.next_year', defaultMessage: 'Next year' },
});

interface IBirthdayInput {
  value?: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const BirthdayInput: React.FC<IBirthdayInput> = ({ value, onChange, required }) => {
  const intl = useIntl();
  const features = useFeatures();
  const { instance } = useInstance();

  const supportsBirthdays = features.birthdays;
  const minAge = instance.pleroma.metadata.birthday_min_age;

  const maxDate = useMemo(() => {
    if (!supportsBirthdays) return;

    let maxDate = new Date();
    maxDate = new Date(maxDate.getTime() - minAge * 1000 * 60 * 60 * 24 + maxDate.getTimezoneOffset() * 1000 * 60);
    return maxDate;
  }, [minAge]);

  const selected = useMemo(() => {
    if (!supportsBirthdays || !value) return;

    const date = new Date(value);
    return new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
  }, [value]);

  if (!supportsBirthdays) return null;

  const handleChange = (date: Date) => onChange(date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 10) : '');

  return (
    <div className='relative mt-1 rounded-md shadow-sm'>
      <Datetime
        value={selected ?? new Date()}
        onChange={handleChange}
        placeholder={intl.formatMessage(messages.birthdayPlaceholder)}
        min={new Date('1900-01-01')}
        max={maxDate}
        required={required}
      />
    </div>
  );
};

export default BirthdayInput;
