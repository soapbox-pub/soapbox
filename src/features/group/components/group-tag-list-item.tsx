import pinFilledIcon from '@tabler/icons/filled/pin.svg';
import eyeOffIcon from '@tabler/icons/outline/eye-off.svg';
import eyeIcon from '@tabler/icons/outline/eye.svg';
import pinIcon from '@tabler/icons/outline/pin.svg';
import { defineMessages, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { useUpdateGroupTag } from 'soapbox/api/hooks/index.ts';
import { HStack, Icon, IconButton, Stack, Text, Tooltip } from 'soapbox/components/ui/index.ts';
import { importEntities } from 'soapbox/entity-store/actions.ts';
import { Entities } from 'soapbox/entity-store/entities.ts';
import { useAppDispatch } from 'soapbox/hooks/index.ts';
import { GroupRoles } from 'soapbox/schemas/group-member.ts';
import toast from 'soapbox/toast.tsx';
import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

import type { Group, GroupTag } from 'soapbox/schemas/index.ts';

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
  tag: GroupTag;
  group: Group;
  isPinnable: boolean;
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
          src={pinFilledIcon}
          className='size-5 text-gray-600'
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
                pinFilledIcon :
                pinIcon
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
            src={pinFilledIcon}
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
          {/* eslint-disable formatjs/no-literal-string-in-jsx */}
          <Text
            weight='bold'
            theme={(tag.visible || !isOwner) ? 'default' : 'subtle'}
            className='group-hover:underline'
            data-testid='group-tag-name'
          >
            #{tag.name}
          </Text>
          {/* eslint-enable formatjs/no-literal-string-in-jsx */}
          <Text size='sm' theme={(tag.visible || !isOwner) ? 'muted' : 'subtle'}>
            {/* eslint-disable formatjs/no-literal-string-in-jsx */}
            {intl.formatMessage(messages.total)}:
            {' '}
            {/* eslint-enable formatjs/no-literal-string-in-jsx */}
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
                  eyeIcon :
                  eyeOffIcon
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