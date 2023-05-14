import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Link, matchPath, useHistory } from 'react-router-dom';

import { Button, Divider, HStack, Popover, Stack, Text } from 'soapbox/components/ui';
import GroupMemberCount from 'soapbox/features/group/components/group-member-count';
import GroupPrivacy from 'soapbox/features/group/components/group-privacy';

import GroupAvatar from '../group-avatar';

import type { Group } from 'soapbox/schemas';

interface IGroupPopoverContainer {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>
  isEnabled: boolean
  group: Group
}

const messages = defineMessages({
  title: { id: 'group.popover.title', defaultMessage: 'Membership required' },
  summary: { id: 'group.popover.summary', defaultMessage: 'You must be a member of the group in order to reply to this status.' },
  action: { id: 'group.popover.action', defaultMessage: 'View Group' },
});

const GroupPopover = (props: IGroupPopoverContainer) => {
  const { children, group, isEnabled } = props;

  const intl = useIntl();
  const history = useHistory();

  const path = history.location.pathname;
  const shouldHideAction = matchPath(path, {
    path: ['/group/:groupSlug'],
    exact: true,
  });

  if (!isEnabled) {
    return children;
  }

  return (
    <Popover
      interaction='click'
      referenceElementClassName='cursor-pointer'
      content={
        <Stack space={4} className='w-80 pb-4'>
          <Stack
            className='relative h-60 rounded-lg bg-white dark:border-primary-800 dark:bg-primary-900'
            data-testid='group-card'
          >
            {/* Group Cover Image */}
            <Stack grow className='relative basis-1/2 rounded-t-lg bg-primary-100 dark:bg-gray-800'>
              {group.header && (
                <img
                  className='absolute inset-0 h-full w-full rounded-t-lg object-cover'
                  src={group.header}
                  alt=''
                />
              )}
            </Stack>

            {/* Group Avatar */}
            <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
              <GroupAvatar group={group} size={64} withRing />
            </div>

            {/* Group Info */}
            <Stack alignItems='center' justifyContent='end' grow className='basis-1/2 py-4' space={0.5}>
              <Text size='lg' weight='bold' dangerouslySetInnerHTML={{ __html: group.display_name_html }} />

              <HStack className='text-gray-700 dark:text-gray-600' space={2} wrap>
                <GroupPrivacy group={group} />
                <GroupMemberCount group={group} />
              </HStack>
            </Stack>
          </Stack>

          <Divider />

          <Stack space={0.5} className='px-4'>
            <Text weight='semibold'>
              {intl.formatMessage(messages.title)}
            </Text>
            <Text theme='muted'>
              {intl.formatMessage(messages.summary)}
            </Text>
          </Stack>

          {!shouldHideAction && (
            <div className='px-4'>
              <Link to={`/group/${group.slug}`}>
                <Button type='button' theme='secondary' block>
                  {intl.formatMessage(messages.action)}
                </Button>
              </Link>
            </div>
          )}
        </Stack>
      }
      isFlush
      children={
        <div className='inline-block'>{children}</div>
      }
    />
  );
};

export default GroupPopover;