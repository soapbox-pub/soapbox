import message2Icon from '@tabler/icons/outline/message-2.svg';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { expandGroupTimelineFromTag } from 'soapbox/actions/timelines.ts';
import { useGroup, useGroupTag } from 'soapbox/api/hooks/index.ts';
import { Column } from 'soapbox/components/ui/column.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

import Timeline from '../ui/components/timeline.tsx';

type RouteParams = { tagId: string; groupId: string };

interface IGroupTimeline {
  params: RouteParams;
}

const GroupTagTimeline: React.FC<IGroupTimeline> = (props) => {
  const dispatch = useAppDispatch();
  const groupId = props.params.groupId;
  const tagId = props.params.tagId;

  const { group } = useGroup(groupId);
  const { tag, isLoading } = useGroupTag(tagId);

  const handleLoadMore = (maxId: string) => {
    dispatch(expandGroupTimelineFromTag(groupId, tag?.name as string, { maxId }));
  };

  useEffect(() => {
    if (tag?.name) {
      dispatch(expandGroupTimelineFromTag(groupId, tag?.name));
    }
  }, [groupId, tag]);


  if (isLoading || !tag || !group) {
    return null;
  }

  return (
    <Column label={`#${tag.name}`}>
      <Timeline
        scrollKey='group_timeline'
        timelineId={`group:tags:${groupId}:${tag.name}`}
        onLoadMore={handleLoadMore}
        showGroup={false}
        emptyMessageCard={false}
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
      />
    </Column>
  );
};

export default GroupTagTimeline;
