import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { expandCommunityTimeline } from 'soapbox/actions/timelines';
import { useCommunityStream } from 'soapbox/api/hooks';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import { Column } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch } from 'soapbox/hooks';

import Timeline from '../ui/components/timeline';

import { SiteBanner } from './components/site-banner';

const LandingTimeline = () => {
  const dispatch = useAppDispatch();
  const next = useAppSelector(state => state.timelines.get('community')?.next);

  const timelineId = 'community';

  const handleLoadMore = (maxId: string) => {
    dispatch(expandCommunityTimeline({ url: next, maxId }));
  };

  const handleRefresh = () => {
    return dispatch(expandCommunityTimeline());
  };

  useCommunityStream();

  useEffect(() => {
    dispatch(expandCommunityTimeline());
  }, []);

  return (
    <Column transparent withHeader={false}>
      <div className='my-12 mb-16 px-4 sm:mb-20'>
        <SiteBanner />
      </div>

      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          scrollKey={`${timelineId}_timeline`}
          timelineId={timelineId}
          prefix='home'
          onLoadMore={handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
          divideType='space'
        />
      </PullToRefresh>
    </Column>
  );
};

export default LandingTimeline;
