import { useEffect } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import status5 from 'soapbox/__fixtures__/pleroma-quote-of-quote-post.json';
import status3 from 'soapbox/__fixtures__/pleroma-status-vertical-video-without-metadata.json';
import status4 from 'soapbox/__fixtures__/pleroma-status-with-poll-with-emojis.json';
import status2 from 'soapbox/__fixtures__/pleroma-status-with-poll.json';
import status1 from 'soapbox/__fixtures__/pleroma-status.json';
import status6 from 'soapbox/__fixtures__/truthsocial-status-in-moderation.json';
import { importFetchedStatuses } from 'soapbox/actions/importer/index.ts';
import { expandTimelineSuccess } from 'soapbox/actions/timelines.ts';
import { Column } from 'soapbox/components/ui/column.tsx';
import Timeline from 'soapbox/features/ui/components/timeline.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useIsMobile } from 'soapbox/hooks/useIsMobile.ts';

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
  const isMobile = useIsMobile();

  useEffect(() => {
    dispatch(importFetchedStatuses(MOCK_STATUSES));
    dispatch(expandTimelineSuccess(timelineId, MOCK_STATUSES, null, null, false, false, false));
  }, []);

  return (
    <Column label={intl.formatMessage(messages.title)} transparent={!isMobile}>
      <Timeline
        scrollKey={`${timelineId}_timeline`}
        timelineId={`${timelineId}${onlyMedia ? ':media' : ''}`}
        emptyMessage={<FormattedMessage id='empty_column.test' defaultMessage='The test timeline is empty.' />}
      />
    </Column>
  );
};

export default TestTimeline;
