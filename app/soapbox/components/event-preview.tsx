import classNames from 'clsx';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import EventActionButton from 'soapbox/features/event/components/event-action-button';
import EventDate from 'soapbox/features/event/components/event-date';
import { useAppSelector } from 'soapbox/hooks';

import Icon from './icon';
import { Button, HStack, Stack, Text } from './ui';
import VerificationBadge from './verification_badge';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  bannerHeader: { id: 'event.banner', defaultMessage: 'Event banner' },
  leaveConfirm: { id: 'confirmations.leave_event.confirm', defaultMessage: 'Leave event' },
  leaveMessage: { id: 'confirmations.leave_event.message', defaultMessage: 'If you want to rejoin the event, the request will be manually reviewed again. Are you sure you want to proceed?' },
});

interface IEventPreview {
  status: StatusEntity,
  className?: string,
}

const EventPreview: React.FC<IEventPreview> = ({ status, className }) => {
  const intl = useIntl();

  const me = useAppSelector((state) => state.me);

  const account = status.account as AccountEntity;
  const event = status.event!;

  const banner = status.media_attachments?.find(({ description }) => description === 'Banner');

  return (
    <div className={classNames('rounded-lg bg-gray-100 dark:bg-primary-800 relative overflow-hidden', className)}>
      <div className='absolute top-28 right-3'>
        {account.id === me ? (
          <Button
            size='sm'
            theme='secondary'
            to={`/@${account.acct}/events/${status.id}`}
          >
            <FormattedMessage id='event.manage' defaultMessage='Manage' />
          </Button>
        ) : <EventActionButton status={status} />}
      </div>
      <div className='bg-primary-200 dark:bg-gray-600 h-40'>
        {banner && <img className='h-full w-full object-cover' src={banner.url} alt={intl.formatMessage(messages.bannerHeader)} />}
      </div>
      <Stack className='p-2.5' space={2}>
        <Text weight='semibold'>{event.name}</Text>

        <div className='flex gap-y-1 gap-x-2 flex-wrap text-gray-700 dark:text-gray-600'>
          <HStack alignItems='center' space={2}>
            <Icon src={require('@tabler/icons/user.svg')} />
            <span>
              <span dangerouslySetInnerHTML={{ __html: account.display_name_html }} />
              {account.verified && <VerificationBadge />}
            </span>
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
