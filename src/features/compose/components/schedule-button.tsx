import calendarStatsIcon from '@tabler/icons/outline/calendar-stats.svg';
import { defineMessages, useIntl } from 'react-intl';

import { addSchedule, removeSchedule } from 'soapbox/actions/compose.ts';
import { useAppDispatch, useCompose } from 'soapbox/hooks/index.ts';

import ComposeFormButton from './compose-form-button.tsx';

const messages = defineMessages({
  add_schedule: { id: 'schedule_button.add_schedule', defaultMessage: 'Schedule post for later' },
  remove_schedule: { id: 'schedule_button.remove_schedule', defaultMessage: 'Post immediately' },
});

interface IScheduleButton {
  composeId: string;
  disabled?: boolean;
}

const ScheduleButton: React.FC<IScheduleButton> = ({ composeId, disabled }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const compose = useCompose(composeId);

  const active = !!compose.schedule;
  const unavailable = !!compose.id;

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
      icon={calendarStatsIcon}
      title={intl.formatMessage(active ? messages.remove_schedule : messages.add_schedule)}
      active={active}
      disabled={disabled}
      onClick={handleClick}
    />
  );
};

export default ScheduleButton;
