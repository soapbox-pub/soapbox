import { useEffect, useRef } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { expandHomeTimeline } from 'soapbox/actions/timelines.ts';
import PullToRefresh from 'soapbox/components/pull-to-refresh.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Timeline from 'soapbox/features/ui/components/timeline.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';

const messages = defineMessages({
  title: { id: 'column.my_nostr', defaultMessage: 'My Nostr' },
});

const HomeTimeline: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const features = useFeatures();
  const { instance } = useInstance();

  const polling = useRef<NodeJS.Timeout | null>(null);

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
    <Column label={intl.formatMessage(messages.title)} withHeader={false} slim>
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          scrollKey='home_timeline'
          onLoadMore={handleLoadMore}
          timelineId='home'
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