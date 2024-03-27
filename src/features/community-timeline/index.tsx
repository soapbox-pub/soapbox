import React, { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { expandCommunityTimeline } from 'soapbox/actions/timelines';
import { useCommunityStream } from 'soapbox/api/hooks';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import { Column } from 'soapbox/components/ui';
import { useAppSelector, useAppDispatch, useSettings, useTheme } from 'soapbox/hooks';

import Timeline from '../ui/components/timeline';

const messages = defineMessages({
  title: { id: 'column.community', defaultMessage: 'Local timeline' },
});

const CommunityTimeline = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const theme = useTheme();

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
    <Column className='-mt-3 sm:mt-0' label={intl.formatMessage(messages.title)} transparent>
      <PullToRefresh onRefresh={handleRefresh}>
        <Timeline
          className='black:p-4 black:sm:p-5'
          scrollKey={`${timelineId}_timeline`}
          timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
          prefix='home'
          onLoadMore={handleLoadMore}
          emptyMessage={<FormattedMessage id='empty_column.community' defaultMessage='The local timeline is empty. Write something publicly to get the ball rolling!' />}
          divideType={theme === 'black' ? 'border' : 'space'}
        />
      </PullToRefresh>
    </Column>
  );
};

export default CommunityTimeline;
