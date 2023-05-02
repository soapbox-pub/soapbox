import clsx from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import EventActionButton from 'soapbox/features/event/components/event-action-button';
import EventDate from 'soapbox/features/event/components/event-date';
import { useAppSelector } from 'soapbox/hooks';

import Icon from './icon';
import { Button, HStack, Stack, Text } from './ui';
import VerificationBadge from './verification-badge';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  eventBanner: { id: 'event.banner', defaultMessage: 'Event banner' },
  leaveConfirm: { id: 'confirmations.leave_event.confirm', defaultMessage: 'Leave event' },
  leaveMessage: { id: 'confirmations.leave_event.message', defaultMessage: 'If you want to rejoin the event, the request will be manually reviewed again. Are you sure you want to proceed?' },
});

interface IEventPreview {
  status: StatusEntity
  className?: string
  hideAction?: boolean
  floatingAction?: boolean
}

const EventPreview: React.FC<IEventPreview> = ({ status, className, hideAction, floatingAction = true }) => {
  const intl = useIntl();

  const me = useAppSelector((state) => state.me);

  const account = status.account as AccountEntity;
  const event = status.event!;

  const banner = event.banner;

  const action = !hideAction && (account.id === me ? (
    <Button
      size='sm'
      theme={floatingAction ? 'secondary' : 'primary'}
      to={`/@${account.acct}/events/${status.id}`}
    >
      <FormattedMessage id='event.manage' defaultMessage='Manage' />
    </Button>
  ) : (
    <EventActionButton
      status={status}
      theme={floatingAction ? 'secondary' : 'primary'}
    />
  ));

  return (
    <div className={clsx('relative w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-primary-800', className)}>
      <div className='absolute right-3 top-28'>
        {floatingAction && action}
      </div>
      <div className='h-40 bg-primary-200 dark:bg-gray-600'>
        {banner && <img className='h-full w-full object-cover' src={banner.url} alt={intl.formatMessage(messages.eventBanner)} />}
      </div>
      <Stack className='p-2.5' space={2}>
        <HStack space={2} alignItems='center' justifyContent='between'>
          <Text weight='semibold' truncate>{event.name}</Text>

          {!floatingAction && action}
        </HStack>

        <div className='flex flex-wrap gap-x-2 gap-y-1 text-gray-700 dark:text-gray-600'>
          <HStack alignItems='center' space={2}>
            <Icon src={require('@tabler/icons/user.svg')} />
            <HStack space={1} alignItems='center' grow>
              <span dangerouslySetInnerHTML={{ __html: account.display_name_html }} />
              {account.verified && <VerificationBadge />}
            </HStack>
          </HStack>

          <EventDate status={status} />

          {event.location && (
            <HStack alignItems='center' space={2}>
              <Icon src={require('@tabler/icons/map-pin.svg')} />
              <span>
                {event.location.get('name')}
              </span>
            </HStack>
          )}
        </div>
      </Stack>
    </div>
  );
};

export default EventPreview;
