import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Virtuoso } from 'react-virtuoso';

import { importFetchedStatuses } from 'soapbox/actions/importer';
import { expandTimelineSuccess } from 'soapbox/actions/timelines';
import SubNavigation from 'soapbox/components/sub_navigation';
import StatusContainer from 'soapbox/containers/status_container';
import { useAppSelector } from 'soapbox/hooks';

import { Column } from '../../components/ui';

const messages = defineMessages({
  title: { id: 'column.test', defaultMessage: 'Test timeline' },
});

/**
 * List of mock statuses to display in the timeline.
 * These get embedded into the build, but only in this chunk, so it's okay.
 */
const MOCK_STATUSES: any[] = [
  require('soapbox/__fixtures__/pleroma-status-with-poll.json'),
  require('soapbox/__fixtures__/pleroma-status-vertical-video-without-metadata.json'),
  require('soapbox/__fixtures__/pleroma-status-with-poll-with-emojis.json'),
  require('soapbox/__fixtures__/pleroma-quote-of-quote-post.json'),
  require('soapbox/__fixtures__/truthsocial-status-with-external-video.json'),
];

const timelineId = 'test';
// const onlyMedia = false;

const TestTimeline: React.FC = () => {
  const intl = useIntl();
  const dispatch = useDispatch();
  const statusIds = useAppSelector((state) => state.timelines.getIn([timelineId, 'items'], ImmutableOrderedSet()));

  React.useEffect(() => {
    dispatch(importFetchedStatuses(MOCK_STATUSES));
    dispatch(expandTimelineSuccess(timelineId, MOCK_STATUSES, null, false, false, false));
  }, []);

  return (
    <Column label={intl.formatMessage(messages.title)} transparent>
      <SubNavigation message={intl.formatMessage(messages.title)} />
      <Virtuoso
        useWindowScroll
        data={statusIds.toArray()}
        itemContent={(index, statusId) => (
          // @ts-ignore
          <StatusContainer id={statusId} />
        )}
      />
    </Column>
  );
};

export default TestTimeline;
