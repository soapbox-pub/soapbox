import calendarEventIcon from '@tabler/icons/outline/calendar-event.svg';
import { FormattedMessage } from 'react-intl';

import { openModal } from '@/actions/modals.ts';
import Button from '@/components/ui/button.tsx';
import Stack from '@/components/ui/stack.tsx';
import Text from '@/components/ui/text.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';

const NewEventPanel = () => {
  const dispatch = useAppDispatch();

  const createEvent = () => {
    dispatch(openModal('COMPOSE_EVENT'));
  };

  return (
    <Stack space={2}>
      <Stack>
        <Text size='lg' weight='bold'>
          <FormattedMessage id='new_event_panel.title' defaultMessage='Create New Event' />
        </Text>

        <Text theme='muted' size='sm'>
          <FormattedMessage id='new_event_panel.subtitle' defaultMessage="Can't find what you're looking for? Schedule your own event." />
        </Text>
      </Stack>

      <Button
        icon={calendarEventIcon}
        onClick={createEvent}
        theme='secondary'
        block
      >
        <FormattedMessage id='new_event_panel.action' defaultMessage='Create event' />
      </Button>
    </Stack>
  );
};

export default NewEventPanel;
