import { useEffect } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

import { fetchPinnedStatuses } from '@/actions/pin-statuses.ts';
import MissingIndicator from '@/components/missing-indicator.tsx';
import StatusList from '@/components/status-list.tsx';
import { Column } from '@/components/ui/column.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { selectOwnAccount } from '@/selectors/index.ts';

const messages = defineMessages({
  heading: { id: 'column.pins', defaultMessage: 'Pinned posts' },
});

const PinnedStatuses = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { username } = useParams<{ username: string }>();

  const meUsername = useAppSelector((state) => selectOwnAccount(state)?.username || '');
  const statusIds = useAppSelector((state) => state.status_lists.get('pins')!.items);
  const isLoading = useAppSelector((state) => !!state.status_lists.get('pins')!.isLoading);
  const hasMore = useAppSelector((state) => !!state.status_lists.get('pins')!.next);

  const isMyAccount = username.toLowerCase() === meUsername.toLowerCase();

  useEffect(() => {
    dispatch(fetchPinnedStatuses());
  }, []);

  if (!isMyAccount) {
    return (
      <MissingIndicator />
    );
  }

  return (
    <Column label={intl.formatMessage(messages.heading)} transparent>
      <StatusList
        statusIds={statusIds}
        scrollKey='pinned_statuses'
        hasMore={hasMore}
        isLoading={isLoading}
        emptyMessage={<FormattedMessage id='pinned_statuses.none' defaultMessage='No pins to show.' />}
      />
    </Column>
  );
};

export default PinnedStatuses;
