import React, { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { expandCommunityTimeline } from 'soapbox/actions/timelines';
import { useCommunityStream } from 'soapbox/api/hooks';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import { Column } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch, useInstance, useTheme } from 'soapbox/hooks';
import { useIsMobile } from 'soapbox/hooks/useIsMobile';

import AboutPage from '../about';
import Timeline from '../ui/components/timeline';

import { SiteBanner } from './components/site-banner';

const LandingTimeline = () => {
  const dispatch = useAppDispatch();
  const instance = useInstance();
  const theme = useTheme();
  const isMobile = useIsMobile();

  const timelineEnabled = !instance.pleroma.metadata.restrict_unauthenticated.timelines.local;
  const next = useAppSelector(state => state.timelines.get('community')?.next);

  const timelineId = 'community';

  const handleLoadMore = (maxId: string) => {
    if (timelineEnabled) {
      dispatch(expandCommunityTimeline({ url: next, maxId }));
    }
  };

  const handleRefresh = async () => {
    if (timelineEnabled) {
      return dispatch(expandCommunityTimeline());
    }
  };

  useCommunityStream({ enabled: timelineEnabled });

  useEffect(() => {
    if (timelineEnabled) {
      dispatch(expandCommunityTimeline());
    }
  }, []);

  return (
    <Column transparent={!isMobile} withHeader={false}>
      <div className='my-12 mb-16 px-4 sm:mb-20'>
        <SiteBanner />
      </div>

      {timelineEnabled ? (
        <PullToRefresh onRefresh={handleRefresh}>
          <Timeline
            className='black:p-4 black:sm:p-5'
            scrollKey={`${timelineId}_timeline`}
            timelineId={timelineId}
            prefix='home'
            onLoadMore={handleLoadMore}
            emptyMessage={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
            divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
          />
        </PullToRefresh>
      ) : (
        <AboutPage />
      )}
    </Column>
  );
};

export default LandingTimeline;
