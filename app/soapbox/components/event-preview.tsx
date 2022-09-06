import React, { useCallback } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';

import { useAppSelector } from 'soapbox/hooks';

import Icon from './icon';
import { Button, HStack, Stack, Text } from './ui';
import VerificationBadge from './verification_badge';

import type { Account as AccountEntity, Status as StatusEntity } from 'soapbox/types/entities';

interface IEventPreview {
  status: StatusEntity,
}

const EventPreview: React.FC<IEventPreview> = ({ status }) => {
  const me = useAppSelector((state) => state.me);

  const account = status.account as AccountEntity;
  const event = status.event!;

  const banner = status.media_attachments?.find(({ description }) => description === 'Banner');

  const renderDate = useCallback(() => {
    if (!event.start_time) return null;

    const startDate = new Date(event.start_time);

    let date;

    if (event.end_time) {
      const endDate = new Date(event.end_time);

      const sameDay = startDate.getDate() === endDate.getDate() && startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();

      if (sameDay) {
        date = (
          <>
            <FormattedDate value={event.start_time} year='2-digit' month='short' day='2-digit' weekday='short' hour='2-digit' minute='2-digit' />
            {' - '}
            <FormattedDate value={event.end_time} hour='2-digit' minute='2-digit' />
          </>
        );
      } else {
        date = (
          <>
            <FormattedDate value={event.start_time} year='2-digit' month='short' day='2-digit' weekday='short' />
            {' - '}
            <FormattedDate value={event.end_time} year='2-digit' month='short' day='2-digit' weekday='short' />
          </>
        );
      }
    } else {
      date = (
        <FormattedDate value={event.start_time} year='2-digit' month='short' day='2-digit' weekday='short' hour='2-digit' minute='2-digit' />
      );
    }

    return (
      <HStack alignItems='center' space={1}>
        <Icon src={require('@tabler/icons/calendar.svg')} />
        <span>{date}</span>
      </HStack>
    );
  }, [event.start_time, event.end_time]);

  return (
    <div className='rounded-lg bg-gray-100 dark:bg-primary-800 shadow-xl relative overflow-hidden'>
      <div className='absolute top-28 right-3'>
        {account.id === me ? (
          <Button
            size='sm'
            theme='secondary'
            to={`/@${account.acct}/events/${status.id}`}
          >
            <FormattedMessage id='event.manage' defaultMessage='Manage' />
          </Button>
        ) : event.join_state === 'accept' ? (
          <Button
            size='sm'
            theme='secondary'
            icon={require('@tabler/icons/check.svg')}
          >
            <FormattedMessage id='event.join_state.accept' defaultMessage='Going' />
          </Button>
        ) : (
          <Button
            size='sm'
            theme='primary'
          >
            <FormattedMessage id='event.join_state.empty' defaultMessage='Participate' />
          </Button>
        )}
      </div>
      <div className='bg-primary-200 dark:bg-gray-600 h-40'>
        {banner && <img className='h-full w-full object-cover' src={banner.url} alt={banner.url} />}
      </div>
      <Stack className='p-2.5' space={2}>
        <Text weight='semibold'>{event.name}</Text>

        <div className='flex gap-y-1 gap-x-2 flex-wrap text-gray-700 dark:text-gray-600'>
          <HStack alignItems='center' space={1}>
            <Icon src={require('@tabler/icons/user.svg')} />
            <span>
              <span dangerouslySetInnerHTML={{ __html: account.display_name_html }} />
              {account.verified && <VerificationBadge />}
            </span>
          </HStack>

          {renderDate()}

          {event.location && (
            <HStack alignItems='center' space={1}>
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
