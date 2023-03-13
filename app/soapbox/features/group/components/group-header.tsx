import { List as ImmutableList } from 'immutable';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { openModal } from 'soapbox/actions/modals';
import StillImage from 'soapbox/components/still-image';
import { Avatar, HStack, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';
import { normalizeAttachment } from 'soapbox/normalizers';
import { isDefaultHeader } from 'soapbox/utils/accounts';

import GroupActionButton from './group-action-button';
import GroupMemberCount from './group-member-count';
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

  if (!group) {
    return (
      <div className='-mx-4 -mt-4'>
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
          className='h-32 w-full bg-gray-200 object-center dark:bg-gray-900/50 md:rounded-t-xl lg:h-52'
        />
      );

      if (!isDefaultHeader(group.header)) {
        header = (
          <a href={group.header} onClick={handleHeaderClick} target='_blank'>
            {header}
          </a>
        );
      }
    }

    return header;
  };

  return (
    <div className='-mx-4 -mt-4'>
      <div className='relative'>
        {renderHeader()}

        <div className='absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2'>
          <a href={group.avatar} onClick={handleAvatarClick} target='_blank'>
            <Avatar
              className='ring-[3px] ring-white dark:ring-primary-900'
              src={group.avatar}
              size={80}
            />
          </a>
        </div>
      </div>

      <Stack alignItems='center' space={3} className='mt-10 py-4'>
        <Text
          size='xl'
          weight='bold'
          dangerouslySetInnerHTML={{ __html: group.display_name_html }}
        />

        <Stack space={1} alignItems='center'>
          <HStack className='text-gray-700 dark:text-gray-600' space={2} wrap>
            <GroupRelationship group={group} />
            <GroupPrivacy group={group} />
            <GroupMemberCount group={group} />
          </HStack>

          <Text theme='muted' dangerouslySetInnerHTML={{ __html: group.note_emojified }} />
        </Stack>

        <GroupActionButton group={group} />
      </Stack>
    </div>
  );
};

export default GroupHeader;
