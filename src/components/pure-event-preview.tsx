import mapPinIcon from '@tabler/icons/outline/map-pin.svg';
import userIcon from '@tabler/icons/outline/user.svg';
import clsx from 'clsx';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { EntityTypes, Entities } from 'soapbox/entity-store/entities.ts';
import PureEventActionButton from 'soapbox/features/event/components/pure-event-action-button.tsx';
import PureEventDate from 'soapbox/features/event/components/pure-event-date.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

import Icon from './icon.tsx';
import VerificationBadge from './verification-badge.tsx';


const messages = defineMessages({
  eventBanner: { id: 'event.banner', defaultMessage: 'Event banner' },
  leaveConfirm: { id: 'confirmations.leave_event.confirm', defaultMessage: 'Leave event' },
  leaveMessage: { id: 'confirmations.leave_event.message', defaultMessage: 'If you want to rejoin the event, the request will be manually reviewed again. Are you sure you want to proceed?' },
});

interface IPureEventPreview {
  status: EntityTypes[Entities.STATUSES];
  className?: string;
  hideAction?: boolean;
  floatingAction?: boolean;
}

const PureEventPreview: React.FC<IPureEventPreview> = ({ status, className, hideAction, floatingAction = true }) => {
  const intl = useIntl();

  const me = useAppSelector((state) => state.me);

  const account = status.account;
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
    <PureEventActionButton
      status={status}
      theme={floatingAction ? 'secondary' : 'primary'}
    />
  ));

  return (
    <div className={clsx('relative w-full overflow-hidden rounded-lg bg-gray-100 black:border black:border-gray-800 black:bg-black dark:bg-primary-800', className)}>
      <div className='absolute right-3 top-28'>
        {floatingAction && action}
      </div>
      <div className='h-40 bg-primary-200 dark:bg-gray-600'>
        {banner && <img className='size-full object-cover' src={banner.url} alt={intl.formatMessage(messages.eventBanner)} />}
      </div>
      <Stack className='p-2.5' space={2}>
        <HStack space={2} alignItems='center' justifyContent='between'>
          <Text weight='semibold' truncate>{event.name}</Text>

          {!floatingAction && action}
        </HStack>

        <div className='flex flex-wrap gap-x-2 gap-y-1 text-gray-700 dark:text-gray-600'>
          <HStack alignItems='center' space={2}>
            <Icon src={userIcon} />
            <HStack space={1} alignItems='center' grow>
              <span>{account.display_name}</span>
              {account.verified && <VerificationBadge />}
            </HStack>
          </HStack>

          <PureEventDate status={status} />

          {event.location && (
            <HStack alignItems='center' space={2}>
              <Icon src={mapPinIcon} />
              <span>
                {event.location?.name}
              </span>
            </HStack>
          )}
        </div>
      </Stack>
    </div>
  );
};

export default PureEventPreview;
