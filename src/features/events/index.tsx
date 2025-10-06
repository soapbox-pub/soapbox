import { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { fetchJoinedEvents, fetchRecentEvents } from '@/actions/events.ts';
import { openModal } from '@/actions/modals.ts';
import Button from '@/components/ui/button.tsx';
import { CardBody, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { Column } from '@/components/ui/column.tsx';
import HStack from '@/components/ui/hstack.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';

import EventCarousel from './components/event-carousel.tsx';

const messages = defineMessages({
  title: { id: 'column.events', defaultMessage: 'Events' },
});

const Events = () => {
  const intl = useIntl();

  const dispatch = useAppDispatch();

  const recentEvents = useAppSelector((state) => state.status_lists.get('recent_events')!.items);
  const recentEventsLoading = useAppSelector((state) => state.status_lists.get('recent_events')!.isLoading);
  const joinedEvents = useAppSelector((state) => state.status_lists.get('joined_events')!.items);
  const joinedEventsLoading = useAppSelector((state) => state.status_lists.get('joined_events')!.isLoading);

  const onComposeEvent = () => {
    dispatch(openModal('COMPOSE_EVENT'));
  };

  useEffect(() => {
    dispatch(fetchRecentEvents());
    dispatch(fetchJoinedEvents());
  }, []);

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <HStack className='mb-2' space={2} justifyContent='between'>
        <CardTitle title={<FormattedMessage id='events.recent_events' defaultMessage='Recent events' />} />
        <Button
          className='ml-auto xl:hidden'
          theme='primary'
          size='sm'
          onClick={onComposeEvent}
        >
          <FormattedMessage id='events.create_event' defaultMessage='Create event' />
        </Button>
      </HStack>
      <CardBody className='mb-2'>
        <EventCarousel
          statusIds={recentEvents}
          isLoading={recentEventsLoading}
          emptyMessage={<FormattedMessage id='events.recent_events.empty' defaultMessage='There are no public events yet.' />}
        />
      </CardBody>
      <CardHeader className='mb-2'>
        <CardTitle title={<FormattedMessage id='events.joined_events' defaultMessage='Joined events' />} />
      </CardHeader>
      <CardBody>
        <EventCarousel
          statusIds={joinedEvents}
          isLoading={joinedEventsLoading}
          emptyMessage={<FormattedMessage id='events.joined_events.empty' defaultMessage="You haven't joined any event yet." />}
        />
      </CardBody>
    </Column>
  );
};

export default Events;
