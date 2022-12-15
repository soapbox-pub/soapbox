import { List as ImmutableList } from 'immutable';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import StillImage from 'soapbox/components/still-image';
import { Avatar, Button, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';
import { normalizeAttachment } from 'soapbox/normalizers';

import type { Group } from 'soapbox/types/entities';

const messages = defineMessages({
  header: { id: 'group.header.alt', defaultMessage: 'Group header' },
});

interface IGroupHeader {
  group?: Group | false | null,
}

const GroupHeader: React.FC<IGroupHeader> = ({ group }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  if (!group) {
    return (
      <div className='-mt-4 -mx-4'>
        <div>
          <div className='relative h-32 w-full lg:h-48 md:rounded-t-xl bg-gray-200 dark:bg-gray-900/50' />
        </div>

        <div className='px-4 sm:px-6'>
          <HStack alignItems='bottom' space={5} className='-mt-12'>
            <div className='flex relative'>
              <div
                className='h-24 w-24 bg-gray-400 rounded-full ring-4 ring-white dark:ring-gray-800'
              />
            </div>
          </HStack>
        </div>
      </div>
    );
  }

  const onAvatarClick = () => {
    const avatar = normalizeAttachment({
      type: 'image',
      url: group.avatar,
    });
    dispatch(openModal('MEDIA', { media: ImmutableList.of(avatar), index: 0 }));
  };

  const handleAvatarClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onAvatarClick();
    }
  };

  const onHeaderClick = () => {
    const header = normalizeAttachment({
      type: 'image',
      url: group.header,
    });
    dispatch(openModal('MEDIA', { media: ImmutableList.of(header), index: 0 }));
  };

  const handleHeaderClick: React.MouseEventHandler = (e) => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onHeaderClick();
    }
  };

  const makeActionButton = () => {
    if (group.relationship?.role === 'admin') {
      return (
        <Button
          theme='secondary'
          // to={`/@${account.acct}/events/${status.id}`}
        >
          <FormattedMessage  id='group.manage' defaultMessage='Edit group' />
        </Button>
      );
    }

    return null;
  };

  const actionButton = makeActionButton();

  return (
    <div className='-mt-4 -mx-4'>
      <div className='relative'>
        <div className='relative flex flex-col justify-center h-32 w-full lg:h-[200px] md:rounded-t-xl bg-gray-200 dark:bg-gray-900/50 overflow-hidden isolate'>
          {group.header && (
            <a href={group.header} onClick={handleHeaderClick} target='_blank'>
              <StillImage
                src={group.header}
                alt={intl.formatMessage(messages.header)}
              />
            </a>
          )}
        </div>
        <div className='absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2'>
          <a href={group.avatar} onClick={handleAvatarClick} target='_blank'>
            <Avatar className='ring-[3px] ring-white dark:ring-primary-900' src={group.avatar} size={72} />
          </a>
        </div>
      </div>

      <Stack className='p-3 pt-12' alignItems='center' space={2}>
        <Text className='mb-1' size='xl' weight='bold' dangerouslySetInnerHTML={{ __html: group.display_name_html }} />
        <HStack className='text-gray-700 dark:text-gray-600' space={3} wrap>
          {group.relationship?.role === 'admin' ? (
            <HStack space={1} alignItems='center'>
              <Icon className='h-4 w-4' src={require('@tabler/icons/users.svg')} />
              <span>Owner</span>
            </HStack>
          ) : group.relationship?.role === 'moderator' && (
            <HStack space={1} alignItems='center'>
              <Icon className='h-4 w-4' src={require('@tabler/icons/gavel.svg')} />
              <span>Moderator</span>
            </HStack>
          )}
          {group.locked ? (
            <HStack space={1} alignItems='center'>
              <Icon className='h-4 w-4' src={require('@tabler/icons/lock.svg')} />
              <span>Private</span>
            </HStack>
          ) : (
            <HStack space={1} alignItems='center'>
              <Icon className='h-4 w-4' src={require('@tabler/icons/world.svg')} />
              <span>Public</span>
            </HStack>
          )}
        </HStack>
        <Text theme='muted' dangerouslySetInnerHTML={{ __html: group.note_emojified }} />
        {actionButton}
      </Stack>
    </div>
  );
};

export default GroupHeader;
