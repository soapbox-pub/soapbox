import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { setSchedule, removeSchedule } from 'soapbox/actions/compose';
import IconButton from 'soapbox/components/icon-button';
import { HStack, Stack, Text } from 'soapbox/components/ui';
import { Datetime } from 'soapbox/components/ui/datetime/datetime';
import { useAppDispatch, useCompose } from 'soapbox/hooks';

const messages = defineMessages({
  schedule: { id: 'schedule.post_time', defaultMessage: 'Post Date/Time' },
  remove: { id: 'schedule.remove', defaultMessage: 'Remove schedule' },
});

export interface IScheduleForm {
  composeId: string;
}

const ScheduleForm: React.FC<IScheduleForm> = ({ composeId }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const scheduledAt = useCompose(composeId).schedule;
  const active = !!scheduledAt;

  const fiveMinutesFromNow = new Date(new Date().getTime() + 300_000);

  const onSchedule = (date: Date) => {
    dispatch(setSchedule(composeId, date));
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    dispatch(removeSchedule(composeId));
    e.preventDefault();
  };

  if (!active) {
    return null;
  }

  return (
    <Stack space={2}>
      <Text weight='medium'>
        <FormattedMessage id='datepicker.hint' defaultMessage='Scheduled to post at…' />
      </Text>
      <HStack space={2} alignItems='center'>
        <Datetime
          onChange={onSchedule}
          value={scheduledAt}
          min={fiveMinutesFromNow}
        />
        <IconButton
          iconClassName='h-4 w-4'
          className='bg-transparent text-gray-400 hover:text-gray-600'
          src={require('@tabler/icons/outline/x.svg')}
          onClick={handleRemove}
          title={intl.formatMessage(messages.remove)}
        />
      </HStack>
    </Stack>
  );
};

export default ScheduleForm;
