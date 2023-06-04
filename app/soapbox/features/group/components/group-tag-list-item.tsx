import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { useUpdateGroupTag } from 'soapbox/api/hooks';
import { HStack, Icon, IconButton, Stack, Text, Tooltip } from 'soapbox/components/ui';
import { importEntities } from 'soapbox/entity-store/actions';
import { Entities } from 'soapbox/entity-store/entities';
import { useAppDispatch } from 'soapbox/hooks';
import { GroupRoles } from 'soapbox/schemas/group-member';
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
  const dispatch = useAppDispatch();

  const intl = useIntl();
  const { updateGroupTag } = useUpdateGroupTag(group.id, tag.id);

  const isOwner = group.relationship?.role === GroupRoles.OWNER;

  const toggleVisibility = () => {
    const isHiding = tag.visible;

    updateGroupTag({
      group_tag_type: isHiding ? 'hidden' : 'normal',
    }, {
      onSuccess() {
        const entity: GroupTag = {
          ...tag,
          visible: !tag.visible,
          pinned: isHiding ? false : tag.pinned, // unpin if we're hiding
        };
        dispatch(importEntities([entity], Entities.GROUP_TAGS));

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
      group_tag_type: tag.pinned ? 'normal' : 'pinned',
    }, {
      onSuccess() {
        const entity = {
          ...tag,
          pinned: !tag.pinned,
        };
        dispatch(importEntities([entity], Entities.GROUP_TAGS));

        toast.success(
          entity.pinned ?
            intl.formatMessage(messages.pinSuccess) :
            intl.formatMessage(messages.unpinSuccess),
        );
      },
    });
  };

  const renderPinIcon = () => {
    if (!isOwner && tag.pinned) {
      return (
        <Icon
          src={require('@tabler/icons/pin-filled.svg')}
          className='h-5 w-5 text-gray-600'
          data-testid='pin-icon'
        />
      );
    }

    if (!isOwner) {
      return null;
    }

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
            theme='transparent'
            src={
              tag.pinned ?
                require('@tabler/icons/pin-filled.svg') :
                require('@tabler/icons/pin.svg')
            }
            iconClassName='h-5 w-5 text-primary-500 dark:text-accent-blue'
            data-testid='pin-icon'
          />
        </Tooltip>
      );
    }

    if (!isPinnable && tag.pinned) {
      return (
        <Tooltip text={intl.formatMessage(messages.unpinTag)}>
          <IconButton
            onClick={togglePin}
            theme='transparent'
            src={require('@tabler/icons/pin-filled.svg')}
            iconClassName='h-5 w-5 text-primary-500 dark:text-accent-blue'
          />
        </Tooltip>

      );
    }
  };

  return (
    <HStack
      alignItems='center'
      justifyContent='between'
      data-testid='group-tag-list-item'
    >
      <Link to={`/group/${group.slug}/tag/${tag.id}`} className='group grow'>
        <Stack>
          <Text
            weight='bold'
            theme={(tag.visible || !isOwner) ? 'default' : 'subtle'}
            className='group-hover:underline'
            data-testid='group-tag-name'
          >
            #{tag.name}
          </Text>
          <Text size='sm' theme={(tag.visible || !isOwner) ? 'muted' : 'subtle'}>
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

        {isOwner ? (
          <Tooltip
            text={
              tag.visible ?
                intl.formatMessage(messages.hideTag) :
                intl.formatMessage(messages.showTag)
            }
          >
            <IconButton
              onClick={toggleVisibility}
              theme='transparent'
              src={
                tag.visible ?
                  require('@tabler/icons/eye.svg') :
                  require('@tabler/icons/eye-off.svg')
              }
              iconClassName='h-5 w-5 text-primary-500 dark:text-accent-blue'
            />
          </Tooltip>
        ) : null}
      </HStack>
    </HStack>
  );
};

export default GroupTagListItem;