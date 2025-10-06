import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { expandCommunityTimeline } from '@/actions/timelines.ts';
import { useCommunityStream } from '@/api/hooks/index.ts';
import PullToRefresh from '@/components/pull-to-refresh.tsx';
import { Column } from '@/components/ui/column.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { useInstance } from '@/hooks/useInstance.ts';
import { useSettings } from '@/hooks/useSettings.ts';

import Timeline from '../ui/components/timeline.tsx';

const CommunityTimeline = () => {
  const dispatch = useAppDispatch();
  const { instance } = useInstance();

  const settings = useSettings();
  const onlyMedia = settings.community.other.onlyMedia;
  const next = useAppSelector(state => state.timelines.get('community')?.next);

  const timelineId = 'community';

  const handleLoadMore = (maxId: string) => {
    dispatch(expandCommunityTimeline({ url: next, maxId, onlyMedia }));
  };

  const handleRefresh = () => {
    return dispatch(expandCommunityTimeline({ onlyMedia }));
  };

  useCommunityStream({ onlyMedia });

  useEffect(() => {
    dispatch(expandCommunityTimeline({ onlyMedia }));
  }, [onlyMedia]);

  return (
    <Column label={instance.domain} slim withHeader={false}>
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          className='black:p-4 black:sm:p-5'
          scrollKey={`${timelineId}_timeline`}
          timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
          prefix='home'
          onLoadMore={handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
        />
      </PullToRefresh>
    </Column>
  );
};

export default CommunityTimeline;
