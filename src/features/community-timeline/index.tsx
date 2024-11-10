import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { expandCommunityTimeline } from 'soapbox/actions/timelines.ts';
import { useCommunityStream } from 'soapbox/api/hooks/index.ts';
import PullToRefresh from 'soapbox/components/pull-to-refresh.tsx';
import { Column } from 'soapbox/components/ui/index.ts';
import { useAppSelector, useAppDispatch, useSettings, useTheme, useInstance } from 'soapbox/hooks/index.ts';
import { useIsMobile } from 'soapbox/hooks/useIsMobile.ts';

import Timeline from '../ui/components/timeline.tsx';

const CommunityTimeline = () => {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const { instance } = useInstance();

  const settings = useSettings();
  const onlyMedia = settings.community.other.onlyMedia;
  const next = useAppSelector(state => state.timelines.get('community')?.next);

  const timelineId = 'community';
  const isMobile = useIsMobile();

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
    <Column className='-mt-3 sm:mt-0' label={instance.domain} transparent={!isMobile}>
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          className='black:p-4 black:sm:p-5'
          scrollKey={`${timelineId}_timeline`}
          timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
          prefix='home'
          onLoadMore={handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
          divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
        />
      </PullToRefresh>
    </Column>
  );
};

export default CommunityTimeline;
