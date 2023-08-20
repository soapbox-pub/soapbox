import React, { useCallback, useEffect, useState } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import { fetchStatus } from 'soapbox/actions/statuses';
import MissingIndicator from 'soapbox/components/missing-indicator';
import StatusContent from 'soapbox/components/status-content';
import StatusMedia from 'soapbox/components/status-media';
import TranslateButton from 'soapbox/components/translate-button';
import { HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import QuotedStatus from 'soapbox/features/status/containers/quoted-status-container';
import { useAppDispatch, useAppSelector, useSettings, useSoapboxConfig } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';
import { defaultMediaVisibility } from 'soapbox/utils/status';

import type { Status as StatusEntity } from 'soapbox/types/entities';

type RouteParams = { statusId: string };

interface IEventInformation {
  params: RouteParams
}

const EventInformation: React.FC<IEventInformation> = ({ params }) => {
  const dispatch = useAppDispatch();
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector(state => getStatus(state, { id: params.statusId })) as StatusEntity;

  const { tileServer } = useSoapboxConfig();
  const settings = useSettings();
  const displayMedia = settings.get('displayMedia') as string;

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);
  const [showMedia, setShowMedia] = useState<boolean>(defaultMediaVisibility(status, displayMedia));

  useEffect(() => {
    dispatch(fetchStatus(params.statusId)).then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });

    setShowMedia(defaultMediaVisibility(status, displayMedia));
  }, [params.statusId]);

  const handleToggleMediaVisibility = () => {
    setShowMedia(!showMedia);
  };

  const handleShowMap: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    e.preventDefault();

    dispatch(openModal('EVENT_MAP', {
      statusId: status.id,
    }));
  };

  const renderEventLocation = useCallback(() => {
    const event = status!.event!;

    if (!event.location) return null;

    const text = [
      <React.Fragment key='event-name'>
        {event.location.get('name')}
      </React.Fragment>,
    ];

    if (event.location.get('street')?.trim()) {
      text.push (
        <React.Fragment key='event-street'>
          <br />{event.location.get('street')}
        </React.Fragment>,
      );
    }

    const address = [event.location.get('postalCode'), event.location.get('locality'), event.location.get('country')].filter(text => text).join(', ');

    if (address) {
      text.push(
        <React.Fragment key='event-address'>
          <br />
          {address}
        </React.Fragment>,
      );
    }

    if (tileServer && event.location.get('latitude')) {
      text.push(
        <React.Fragment key='event-map'>
          <br />
          <a href='#' className='text-primary-600 hover:underline dark:text-accent-blue' onClick={handleShowMap}>
            <FormattedMessage id='event.show_on_map' defaultMessage='Show on map' />
          </a>
        </React.Fragment>,
      );
    }

    return event.location && (
      <Stack space={1}>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='event.location' defaultMessage='Location' />
        </Text>
        <HStack space={2} alignItems='center'>
          <Icon src={require('@tabler/icons/map-pin.svg')} />
          <Text>{text}</Text>
        </HStack>
      </Stack>
    );
  }, [status]);

  const renderEventDate = useCallback(() => {
    const event = status!.event!;

    if (!event.start_time) return null;

    const startDate = new Date(event.start_time);
    const endDate = event.end_time && new Date(event.end_time);

    const sameDay = endDate && startDate.getDate() === endDate.getDate() && startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();

    return (
      <Stack space={1}>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='event.date' defaultMessage='Date' />
        </Text>
        <HStack space={2} alignItems='center'>
          <Icon src={require('@tabler/icons/calendar.svg')} />
          <Text>
            <FormattedDate
              value={startDate}
              year='numeric'
              month='long'
              day='2-digit'
              weekday='long'
              hour='2-digit'
              minute='2-digit'
            />
            {endDate && (<>
              {' - '}
              <FormattedDate
                value={endDate}
                year={sameDay ? undefined : 'numeric'}
                month={sameDay ? undefined : 'long'}
                day={sameDay ? undefined : '2-digit'}
                weekday={sameDay ? undefined : 'long'}
                hour='2-digit'
                minute='2-digit'
              />
            </>)}
          </Text>
        </HStack>
      </Stack>
    );
  }, [status]);

  const renderLinks = useCallback(() => {
    if (!status.event?.links.size) return null;

    return (
      <Stack space={1}>
        <Text size='xl' weight='bold'>
          <FormattedMessage id='event.website' defaultMessage='External links' />
        </Text>

        {status.event.links.map(link => (
          <HStack space={2} alignItems='center'>
            <Icon src={require('@tabler/icons/link.svg')} />
            <a href={link.remote_url || link.url} className='text-primary-600 hover:underline dark:text-accent-blue' target='_blank'>
              {(link.remote_url || link.url).replace(/^https?:\/\//, '')}
            </a>
          </HStack>
        ))}
      </Stack>
    );
  }, [status]);

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
  } else if (!status) return null;

  return (
    <Stack className='mt-4 sm:p-2' space={2}>
      {!!status.contentHtml.trim() && (
        <Stack space={1}>
          <Text size='xl' weight='bold'>
            <FormattedMessage id='event.description' defaultMessage='Description' />
          </Text>

          <StatusContent status={status} collapsable={false} translatable />

          <TranslateButton status={status} />
        </Stack>
      )}

      <StatusMedia
        status={status}
        showMedia={showMedia}
        onToggleVisibility={handleToggleMediaVisibility}
      />

      {status.quote && status.pleroma.get('quote_visible', true) && (
        <QuotedStatus statusId={status.quote as string} />
      )}

      {renderEventLocation()}

      {renderEventDate()}

      {renderLinks()}
    </Stack>
  );
};

export default EventInformation;
