import { List as ImmutableList } from 'immutable';
import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import { fetchHistory } from 'soapbox/actions/history';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Column } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import PlaceholderStatus from '../placeholder/components/placeholder-status';

import StatusEdit from './components/status-edit';

import type { StatusEdit as StatusEditEntity } from 'soapbox/types/entities';

const messages = defineMessages({
  heading: { id: 'compare_history_modal.header', defaultMessage: 'Edit history' },
});

const StatusHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { statusId } = useParams<{ statusId: string }>();

  const loading = useAppSelector(state => !!state.history.getIn([statusId, 'loading']));
  // @ts-ignore
  const versions = useAppSelector<ImmutableList<StatusEditEntity>>(state => state.history.getIn([statusId, 'items']));

  useEffect(() => {
    dispatch(fetchHistory(statusId));
  }, [statusId]);

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <ScrollableList
        id='status-history'
        isLoading={loading}
        showLoading={loading && versions.size === 0}
        placeholderComponent={() => <PlaceholderStatus variant='rounded' />}
        placeholderCount={20}
        itemClassName='pb-3'
      >
        {versions?.map((version, index) => <StatusEdit key={version.created_at} status={version} latestVersion={index === 0} />)}
      </ScrollableList>
    </Column>
  );
};

export default StatusHistory;
