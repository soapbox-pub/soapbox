import message2Icon from '@tabler/icons/outline/message-2.svg';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { groupCompose, setGroupTimelineVisible, uploadCompose } from '@/actions/compose.ts';
import { expandGroupFeaturedTimeline, expandGroupTimeline } from '@/actions/timelines.ts';
import { useGroup, useGroupStream } from '@/api/hooks/index.ts';
import Avatar from '@/components/ui/avatar.tsx';
import HStack from '@/components/ui/hstack.tsx';
import Icon from '@/components/ui/icon.tsx';
import Stack from '@/components/ui/stack.tsx';
import Text from '@/components/ui/text.tsx';
import Toggle from '@/components/ui/toggle.tsx';
import ComposeForm from '@/features/compose/components/compose-form.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { useDraggedFiles } from '@/hooks/useDraggedFiles.ts';
import { useOwnAccount } from '@/hooks/useOwnAccount.ts';
import { makeGetStatusIds } from '@/selectors/index.ts';

import Timeline from '../ui/components/timeline.tsx';

type RouteParams = { groupId: string };

interface IGroupTimeline {
  params: RouteParams;
}

const getStatusIds = makeGetStatusIds();

const GroupTimeline: React.FC<IGroupTimeline> = (props) => {
  const intl = useIntl();
  const { account } = useOwnAccount();
  const dispatch = useAppDispatch();
  const composer = useRef<HTMLDivElement>(null);

  const { groupId } = props.params;

  const { group } = useGroup(groupId);

  const composeId = `group:${groupId}`;
  const canComposeGroupStatus = !!account && group?.relationship?.member;
  const groupTimelineVisible = useAppSelector((state) => !!state.compose.get(composeId)?.group_timeline_visible);
  const featuredStatusIds = useAppSelector((state) => getStatusIds(state, { type: `group:${group?.id}:pinned` }));

  const { isDragging, isDraggedOver } = useDraggedFiles(composer, (files) => {
    dispatch(uploadCompose(composeId, files, intl));
  });

  const handleLoadMore = (maxId: string) => {
    dispatch(expandGroupTimeline(groupId, { maxId }));
  };

  const handleToggleChange = () => {
    dispatch(setGroupTimelineVisible(composeId, !groupTimelineVisible));
  };

  useGroupStream(groupId);

  useEffect(() => {
    dispatch(expandGroupTimeline(groupId));
    dispatch(expandGroupFeaturedTimeline(groupId));
    dispatch(groupCompose(composeId, groupId));
  }, [groupId]);

  if (!group) {
    return null;
  }

  return (
    <Stack space={2}>
      {canComposeGroupStatus && (
        <div className='border-b border-solid border-gray-200 py-6 dark:border-gray-800'>
          <HStack
            ref={composer}
            alignItems='start'
            space={4}
            className={clsx('relative rounded-xl transition', {
              'border-2 border-primary-600 border-dashed z-[99] p-4': isDragging,
              'ring-2 ring-offset-2 ring-primary-600': isDraggedOver,
            })}
          >
            <Link to={`/@${account.acct}`}>
              <Avatar src={account.avatar} size={46} />
            </Link>

            <ComposeForm
              id={composeId}
              shouldCondense
              autoFocus={false}
              group={groupId}
              extra={!group.locked && (
                <HStack alignItems='center' space={4}>
                  <label className='ml-auto cursor-pointer' htmlFor='group-timeline-visible'>
                    <Text theme='muted'>
                      <FormattedMessage id='compose_group.share_to_followers' defaultMessage='Share with my followers' />
                    </Text>
                  </label>
                  <Toggle
                    id='group-timeline-visible'
                    checked={groupTimelineVisible}
                    onChange={handleToggleChange}
                    size='sm'
                  />
                </HStack>
              )}
            />
          </HStack>
        </div>
      )}

      <Timeline
        scrollKey='group_timeline'
        timelineId={composeId}
        onLoadMore={handleLoadMore}
        emptyMessage={
          <Stack space={4} className='py-6' justifyContent='center' alignItems='center'>
            <div className='rounded-full bg-gray-200 p-4 dark:bg-gray-800'>
              <Icon
                src={message2Icon}
                className='size-6 text-gray-600'
              />
            </div>

            <Text theme='muted'>
              <FormattedMessage id='empty_column.group' defaultMessage='There are no posts in this group yet.' />
            </Text>
          </Stack>
        }
        emptyMessageCard={false}
        showGroup={false}
        featuredStatusIds={featuredStatusIds}
      />
    </Stack>
  );
};

export default GroupTimeline;
