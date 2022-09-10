import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { addSchedule, removeSchedule } from 'soapbox/actions/compose';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import ComposeFormButton from './compose_form_button';

const messages = defineMessages({
  add_schedule: { id: 'schedule_button.add_schedule', defaultMessage: 'Schedule post for later' },
  remove_schedule: { id: 'schedule_button.remove_schedule', defaultMessage: 'Post immediately' },
});

interface IScheduleButton {
  composeId: string,
  disabled?: boolean,
}

const ScheduleButton: React.FC<IScheduleButton> = ({ composeId, disabled }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const active = useAppSelector((state) => !!state.compose.get(composeId)!.schedule);
  const unavailable = useAppSelector((state) => !!state.compose.get(composeId)!.id);

  const handleClick = () => {
    if (active) {
      dispatch(removeSchedule(composeId));
    } else {
      dispatch(addSchedule(composeId));
    }
  };

  if (unavailable) {
    return null;
  }

  return (
    <ComposeFormButton
      icon={require('@tabler/icons/calendar-stats.svg')}
      title={intl.formatMessage(active ? messages.remove_schedule : messages.add_schedule)}
      active={active}
      disabled={disabled}
      onClick={handleClick}
    />
  );
};

export default ScheduleButton;
