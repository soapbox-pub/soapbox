import { List as ImmutableList } from 'immutable';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import GroupAvatar from 'soapbox/components/groups/group-avatar';
import StillImage from 'soapbox/components/still-image';
import { HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';
import { normalizeAttachment } from 'soapbox/normalizers';
import { isDefaultHeader } from 'soapbox/utils/accounts';

import GroupActionButton from './group-action-button';
import GroupMemberCount from './group-member-count';
import GroupOptionsButton from './group-options-button';
import GroupPrivacy from './group-privacy';
import GroupRelationship from './group-relationship';

import type { Group } from 'soapbox/types/entities';

const messages = defineMessages({
  header: { id: 'group.header.alt', defaultMessage: 'Group header' },
});

interface IGroupHeader {
  group?: Group | false | null
}

const GroupHeader: React.FC<IGroupHeader> = ({ group }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [isHeaderMissing, setIsHeaderMissing] = useState<boolean>(false);

  if (!group) {
    return (
      <div className='-mx-4 -mt-4 sm:-mx-6 sm:-mt-6' data-testid='group-header-missing'>
        <div>
          <div className='relative h-32 w-full bg-gray-200 dark:bg-gray-900/50 md:rounded-t-xl lg:h-48' />
        </div>

        <div className='px-4 sm:px-6'>
          <HStack alignItems='bottom' space={5} className='-mt-12'>
            <div className='relative flex'>
              <div
                className='h-24 w-24 rounded-full bg-gray-400 ring-4 ring-white dark:ring-gray-800'
              />
            </div>
          </HStack>
        </div>
      </div>
    );
  }

  const isDeleted = !!group.deleted_at;

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

  const renderHeader = () => {
    let header: React.ReactNode;

    if (group.header) {
      header = (
        <StillImage
          src={group.header}
          alt={intl.formatMessage(messages.header)}
          className='relative h-32 w-full bg-gray-200 object-center dark:bg-gray-900/50 md:rounded-t-xl lg:h-52'
          onError={() => setIsHeaderMissing(true)}
        />
      );

      if (!isDefaultHeader(group.header)) {
        header = (
          <a href={group.header} onClick={handleHeaderClick} target='_blank' className='relative w-full'>
            {header}
          </a>
        );
      }
    }

    return (
      <div
        data-testid='group-header-image'
        className='flex h-32 w-full items-center justify-center bg-gray-200 dark:bg-gray-800/30 md:rounded-t-xl lg:h-52'
      >
        {isHeaderMissing ? (
          <Icon src={require('@tabler/icons/photo-off.svg')} className='h-6 w-6 text-gray-500 dark:text-gray-700' />
        ) : header}
      </div>
    );
  };

  return (
    <div className='-mx-4 -mt-4 sm:-mx-6 sm:-mt-6'>
      <div className='relative'>
        {renderHeader()}

        <div className='absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2' data-testid='group-avatar'>
          <a href={group.avatar} onClick={handleAvatarClick} target='_blank'>
            <GroupAvatar
              group={group}
              size={80}
              withRing
            />
          </a>
        </div>
      </div>

      <Stack alignItems='center' space={3} className='mx-auto mt-10 w-5/6 py-4'>
        <Text
          size='xl'
          weight='bold'
          dangerouslySetInnerHTML={{ __html: group.display_name_html }}
          data-testid='group-name'
        />

        {!isDeleted && (
          <>
            <Stack data-testid='group-meta' space={1} alignItems='center'>
              <HStack className='text-gray-700 dark:text-gray-600' space={2} wrap>
                <GroupRelationship group={group} />
                <GroupPrivacy group={group} />
                <GroupMemberCount group={group} />
              </HStack>

              <Text
                theme='muted'
                align='center'
                dangerouslySetInnerHTML={{ __html: group.note_emojified }}
                className='[&_a]:text-primary-600 [&_a]:hover:underline [&_a]:dark:text-accent-blue'
              />
            </Stack>

            <HStack alignItems='center' space={2} data-testid='group-actions'>
              <GroupOptionsButton group={group} />
              <GroupActionButton group={group} />
            </HStack>
          </>
        )}
      </Stack>
    </div>
  );
};

export default GroupHeader;
