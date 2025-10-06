import { useEffect } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import status5 from '@/__fixtures__/pleroma-quote-of-quote-post.json';
import status3 from '@/__fixtures__/pleroma-status-vertical-video-without-metadata.json';
import status4 from '@/__fixtures__/pleroma-status-with-poll-with-emojis.json';
import status2 from '@/__fixtures__/pleroma-status-with-poll.json';
import status1 from '@/__fixtures__/pleroma-status.json';
import status6 from '@/__fixtures__/truthsocial-status-in-moderation.json';
import { importFetchedStatuses } from '@/actions/importer/index.ts';
import { expandTimelineSuccess } from '@/actions/timelines.ts';
import { Column } from '@/components/ui/column.tsx';
import Timeline from '@/features/ui/components/timeline.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';

const messages = defineMessages({
  title: { id: 'column.test', defaultMessage: 'Test timeline' },
});

/**
 * List of mock statuses to display in the timeline.
 * These get embedded into the build, but only in this chunk, so it's okay.
 */
const MOCK_STATUSES = [status1, status2, status3, status4, status5, status6];

const timelineId = 'test';
const onlyMedia = false;

const TestTimeline: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(importFetchedStatuses(MOCK_STATUSES));
    dispatch(expandTimelineSuccess(timelineId, MOCK_STATUSES, null, null, false, false, false));
  }, []);

  return (
    <Column label={intl.formatMessage(messages.title)} slim>
      <Timeline
        scrollKey={`${timelineId}_timeline`}
        timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
        emptyMessage={<FormattedMessage id='empty_column.test' defaultMessage='The test timeline is empty.' />}
      />
    </Column>
  );
};

export default TestTimeline;
