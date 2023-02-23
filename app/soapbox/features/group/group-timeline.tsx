import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { groupCompose } from 'soapbox/actions/compose';
import { fetchGroup } from 'soapbox/actions/groups';
import { connectGroupStream } from 'soapbox/actions/streaming';
import { expandGroupTimeline } from 'soapbox/actions/timelines';
import { Avatar, HStack, Stack } from 'soapbox/components/ui';
import ComposeForm from 'soapbox/features/compose/components/compose-form';
import { useAppDispatch, useAppSelector, useOwnAccount } from 'soapbox/hooks';

import Timeline from '../ui/components/timeline';

type RouteParams = { id: string };

interface IGroupTimeline {
  params: RouteParams
}

const GroupTimeline: React.FC<IGroupTimeline> = (props) => {
  const account = useOwnAccount();
  const dispatch = useAppDispatch();

  const groupId = props.params.id;

  const relationship = useAppSelector((state) => state.group_relationships.get(groupId));

  const handleLoadMore = (maxId: string) => {
    dispatch(expandGroupTimeline(groupId, { maxId }));
  };

  useEffect(() => {
    dispatch(fetchGroup(groupId));
    dispatch(expandGroupTimeline(groupId));

    dispatch(groupCompose(`group:${groupId}`, groupId));

    const disconnect = dispatch(connectGroupStream(groupId));

    return () => {
      disconnect();
    };
  }, [groupId]);

  return (
    <Stack space={2}>
      {!!account && relationship?.member && (
        <div className='border-b border-solid border-gray-200 px-2 py-4 dark:border-gray-800'>
          <HStack alignItems='start' space={4}>
            <Link to={`/@${account.acct}`}>
              <Avatar src={account.avatar} size={46} />
            </Link>

            <ComposeForm
              id={`group:${groupId}`}
              shouldCondense
              autoFocus={false}
              group={groupId}
            />
          </HStack>
        </div>
      )}
      <Timeline
        scrollKey='group_timeline'
        timelineId={`group:${groupId}`}
        onLoadMore={handleLoadMore}
        emptyMessage={<FormattedMessage id='empty_column.group' defaultMessage='There are no posts in this group yet.' />}
        divideType='border'
        showGroup={false}
      />
    </Stack>
  );
};

export default GroupTimeline;
