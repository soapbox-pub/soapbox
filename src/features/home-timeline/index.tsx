import { useEffect, useRef } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { expandHomeTimeline } from 'soapbox/actions/timelines.ts';
import PullToRefresh from 'soapbox/components/pull-to-refresh.tsx';
import { Column, Stack, Text } from 'soapbox/components/ui/index.ts';
import Timeline from 'soapbox/features/ui/components/timeline.tsx';
import { useAppSelector, useAppDispatch, useFeatures, useInstance, useTheme } from 'soapbox/hooks/index.ts';
import { useIsMobile } from 'soapbox/hooks/useIsMobile.ts';

const messages = defineMessages({
  title: { id: 'column.home', defaultMessage: 'Home' },
});

const HomeTimeline: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const { instance } = useInstance();
  const theme = useTheme();

  const polling = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  const isPartial = useAppSelector(state => state.timelines.get('home')?.isPartial === true);
  const next = useAppSelector(state => state.timelines.get('home')?.next);

  const handleLoadMore = (maxId: string) => {
    dispatch(expandHomeTimeline({ url: next, maxId }));
  };

  // Mastodon generates the feed in Redis, and can return a partial timeline
  // (HTTP 206) for new users. Poll until we get a full page of results.
  const checkIfReloadNeeded = () => {
    if (isPartial) {
      polling.current = setInterval(() => {
        dispatch(expandHomeTimeline());
      }, 3000);
    } else {
      stopPolling();
    }
  };

  const stopPolling = () => {
    if (polling.current) {
      clearInterval(polling.current);
      polling.current = null;
    }
  };

  const handleRefresh = () => {
    return dispatch(expandHomeTimeline());
  };

  useEffect(() => {
    checkIfReloadNeeded();

    return () => {
      stopPolling();
    };
  }, [isPartial]);

  return (
    <Column className='py-0' label={intl.formatMessage(messages.title)} transparent={!isMobile} withHeader={false}>
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          className='black:p-4 black:sm:p-5'
          scrollKey='home_timeline'
          onLoadMore={handleLoadMore}
          timelineId='home'
          divideType={(theme === 'black' || isMobile) ? 'border' : 'space'}
          emptyMessage={
            <Stack space={1}>
              <Text size='xl' weight='medium' align='center'>
                <FormattedMessage
                  id='empty_column.home.title'
                  defaultMessage="You're not following anyone yet"
                />
              </Text>

              <Text theme='muted' align='center'>
                <FormattedMessage
                  id='empty_column.home.subtitle'
                  defaultMessage='{siteTitle} gets more interesting once you follow other users.'
                  values={{ siteTitle: instance.title }}
                />
              </Text>

              {features.federating && (
                <Text theme='muted' align='center'>
                  <FormattedMessage
                    id='empty_column.home'
                    defaultMessage='Or you can visit {public} to get started and meet other users.'
                    values={{
                      public: (
                        <Link to='/timeline/local' className='text-primary-600 hover:underline dark:text-primary-400'>
                          <FormattedMessage id='empty_column.home.local_tab' defaultMessage='the {site_title} tab' values={{ site_title: instance.title }} />
                        </Link>
                      ),
                    }}
                  />
                </Text>
              )}
            </Stack>
          }
        />
      </PullToRefresh>
    </Column>
  );
};

export default HomeTimeline;
