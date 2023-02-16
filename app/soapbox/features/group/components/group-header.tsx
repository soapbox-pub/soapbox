import { List as ImmutableList } from 'immutable';
import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { joinGroup, leaveGroup } from 'soapbox/actions/groups';
import { openModal } from 'soapbox/actions/modals';
import StillImage from 'soapbox/components/still-image';
import { Avatar, Button, HStack, Icon, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch } from 'soapbox/hooks';
import { normalizeAttachment } from 'soapbox/normalizers';
import { isDefaultHeader } from 'soapbox/utils/accounts';

import type { Group } from 'soapbox/types/entities';

const messages = defineMessages({
  header: { id: 'group.header.alt', defaultMessage: 'Group header' },
  confirmationHeading: { id: 'confirmations.leave_group.heading', defaultMessage: 'Leave group' },
  confirmationMessage: { id: 'confirmations.leave_group.message', defaultMessage: 'You are about to leave the group. Do you want to continue?' },
  confirmationConfirm: { id: 'confirmations.leave_group.confirm', defaultMessage: 'Leave' },
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

  const onJoinGroup = () => dispatch(joinGroup(group.id));

  const onLeaveGroup = () =>
    dispatch(openModal('CONFIRM', {
      heading: intl.formatMessage(messages.confirmationHeading),
      message: intl.formatMessage(messages.confirmationMessage),
      confirm: intl.formatMessage(messages.confirmationConfirm),
      onConfirm: () => dispatch(leaveGroup(group.id)),
    }));

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

  const makeActionButton = () => {
    if (!group.relationship || !group.relationship.member) {
      return (
        <Button
          theme='primary'
          onClick={onJoinGroup}
        >
          {group.locked ? <FormattedMessage id='group.request_join' defaultMessage='Request to join group' /> : <FormattedMessage id='group.join' defaultMessage='Join group' />}
        </Button>
      );
    }

    if (group.relationship.requested) {
      return (
        <Button
          theme='secondary'
          onClick={onLeaveGroup}
        >
          <FormattedMessage id='group.cancel_request' defaultMessage='Cancel request' />
        </Button>
      );
    }

    if (group.relationship?.role === 'admin') {
      return (
        <Button
          theme='secondary'
          to={`/groups/${group.id}/manage`}
        >
          <FormattedMessage id='group.manage' defaultMessage='Manage group' />
        </Button>
      );
    }

    return (
      <Button
        theme='secondary'
        onClick={onLeaveGroup}
      >
        <FormattedMessage id='group.leave' defaultMessage='Leave group' />
      </Button>
    );
  };

  const actionButton = makeActionButton();

  return (
    <div className='-mx-4 -mt-4'>
      <div className='relative'>
        <div className='relative isolate flex h-32 w-full flex-col justify-center overflow-hidden bg-gray-200 dark:bg-gray-900/50 md:rounded-t-xl lg:h-[200px]'>
          {renderHeader()}
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
              <span><FormattedMessage id='group.role.admin' defaultMessage='Admin' /></span>
            </HStack>
          ) : group.relationship?.role === 'moderator' && (
            <HStack space={1} alignItems='center'>
              <Icon className='h-4 w-4' src={require('@tabler/icons/gavel.svg')} />
              <span><FormattedMessage id='group.role.moderator' defaultMessage='Moderator' /></span>
            </HStack>
          )}
          {group.locked ? (
            <HStack space={1} alignItems='center'>
              <Icon className='h-4 w-4' src={require('@tabler/icons/lock.svg')} />
              <span><FormattedMessage id='group.privacy.locked' defaultMessage='Private' /></span>
            </HStack>
          ) : (
            <HStack space={1} alignItems='center'>
              <Icon className='h-4 w-4' src={require('@tabler/icons/world.svg')} />
              <span><FormattedMessage id='group.privacy.public' defaultMessage='Public' /></span>
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
