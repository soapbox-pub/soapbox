import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { HStack, IconButton, Stack, Text, Tooltip } from 'soapbox/components/ui';
import { useUpdateGroupTag } from 'soapbox/hooks/api';
import toast from 'soapbox/toast';
import { shortNumberFormat } from 'soapbox/utils/numbers';

import type { Group, GroupTag } from 'soapbox/schemas';

const messages = defineMessages({
  hideTag: { id: 'group.tags.hide', defaultMessage: 'Hide topic' },
  showTag: { id: 'group.tags.show', defaultMessage: 'Show topic' },
  total: { id: 'group.tags.total', defaultMessage: 'Total Posts' },
  pinTag: { id: 'group.tags.pin', defaultMessage: 'Pin topic' },
  unpinTag: { id: 'group.tags.unpin', defaultMessage: 'Unpin topic' },
  pinSuccess: { id: 'group.tags.pin.success', defaultMessage: 'Pinned!' },
  unpinSuccess: { id: 'group.tags.unpin.success', defaultMessage: 'Unpinned!' },
  visibleSuccess: { id: 'group.tags.visible.success', defaultMessage: 'Topic marked as visible' },
  hiddenSuccess: { id: 'group.tags.hidden.success', defaultMessage: 'Topic marked as hidden' },
});

interface IGroupMemberListItem {
  tag: GroupTag
  group: Group
  isPinnable: boolean
}

const GroupTagListItem = (props: IGroupMemberListItem) => {
  const { group, tag, isPinnable } = props;

  const intl = useIntl();
  const updateGroupTag = useUpdateGroupTag(group.id, tag.id);

  const toggleVisibility = () => {
    updateGroupTag({
      pinned: !tag.visible,
    }, {
      onSuccess(entity: GroupTag) {
        toast.success(
          entity.visible ?
            intl.formatMessage(messages.visibleSuccess) :
            intl.formatMessage(messages.hiddenSuccess),
        );
      },
    });
  };

  const togglePin = () => {
    updateGroupTag({
      pinned: !tag.pinned,
    }, {
      onSuccess(entity: GroupTag) {
        toast.success(
          entity.pinned ?
            intl.formatMessage(messages.pinSuccess) :
            intl.formatMessage(messages.unpinSuccess),
        );
      },
    });
  };

  const renderPinIcon = () => {
    if (isPinnable) {
      return (
        <Tooltip
          text={
            tag.pinned ?
              intl.formatMessage(messages.unpinTag) :
              intl.formatMessage(messages.pinTag)
          }
        >
          <IconButton
            onClick={togglePin}
            transparent
            src={
              tag.pinned ?
                require('@tabler/icons/pin-filled.svg') :
                require('@tabler/icons/pin.svg')
            }
            iconClassName='h-5 w-5 text-primary-500 dark:text-accent-blue'
          />
        </Tooltip>
      );
    }

    if (!isPinnable && tag.pinned) {
      return (
        <Tooltip text={intl.formatMessage(messages.unpinTag)}>
          <IconButton
            onClick={togglePin}
            transparent
            src={require('@tabler/icons/pin-filled.svg')}
            iconClassName='h-5 w-5 text-primary-500 dark:text-accent-blue'
          />
        </Tooltip>

      );
    }
  };

  return (
    <HStack alignItems='center' justifyContent='between'>
      <Link to={`/groups/${group.id}/tag/${tag.id}`} className='group grow'>
        <Stack>
          <Text
            weight='bold'
            theme={tag.visible ? 'default' : 'subtle'}
            className='group-hover:underline'
          >
            #{tag.name}
          </Text>
          <Text size='sm' theme={tag.visible ? 'muted' : 'subtle'}>
            {intl.formatMessage(messages.total)}:
            {' '}
            <Text size='sm' theme='inherit' weight='semibold' tag='span'>
              {shortNumberFormat(tag.uses)}
            </Text>
          </Text>
        </Stack>
      </Link>

      <HStack alignItems='center' space={2}>
        {tag.visible ? (
          renderPinIcon()
        ) : null}

        <Tooltip
          text={
            tag.visible ?
              intl.formatMessage(messages.hideTag) :
              intl.formatMessage(messages.showTag)
          }
        >
          <IconButton
            onClick={toggleVisibility}
            transparent
            src={
              tag.visible ?
                require('@tabler/icons/eye.svg') :
                require('@tabler/icons/eye-off.svg')
            }
            iconClassName='h-5 w-5 text-primary-500 dark:text-accent-blue'
          />
        </Tooltip>
      </HStack>
    </HStack>
  );
};

export default GroupTagListItem;