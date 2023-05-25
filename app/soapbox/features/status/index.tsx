import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Redirect } from 'react-router-dom';

import {
  fetchNext,
  fetchStatusWithContext,
} from 'soapbox/actions/statuses';
import MissingIndicator from 'soapbox/components/missing-indicator';
import PullToRefresh from 'soapbox/components/pull-to-refresh';
import { Column, Stack } from 'soapbox/components/ui';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

import Thread from './components/thread';
import ThreadLoginCta from './components/thread-login-cta';


const messages = defineMessages({
  title: { id: 'status.title', defaultMessage: 'Post Details' },
  titleDirect: { id: 'status.title_direct', defaultMessage: 'Direct message' },
});

type RouteParams = {
  statusId: string
  groupId?: string
  groupSlug?: string
};

interface IThreadPage {
  params: RouteParams
}

const ThreadPage: React.FC<IThreadPage> = (props) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const getStatus = useCallback(makeGetStatus(), []);

  const me = useAppSelector(state => state.me);
  const status = useAppSelector(state => getStatus(state, { id: props.params.statusId }));

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);
  const [next, setNext] = useState<string>();

  /** Fetch the status (and context) from the API. */
  const fetchData = async () => {
    const { params } = props;
    const { statusId } = params;
    const { next } = await dispatch(fetchStatusWithContext(statusId));
    setNext(next);
  };

  // Load data.
  useEffect(() => {
    fetchData().then(() => {
      setIsLoaded(true);
    }).catch(error => {
      setIsLoaded(true);
    });
  }, [props.params.statusId]);

  const handleLoadMore = useCallback(debounce(() => {
    if (next && status) {
      dispatch(fetchNext(status.id, next)).then(({ next }) => {
        setNext(next);
      }).catch(() => { });
    }
  }, 300, { leading: true }), [next, status]);

  const handleRefresh = () => {
    return fetchData();
  };

  if (status?.event) {
    return (
      <Redirect to={`/@${status.getIn(['account', 'acct'])}/events/${status.id}`} />
    );
  }

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
  } else if (!status) {
    return (
      <Column>
        <PlaceholderStatus />
      </Column>
    );
  }

  if (status.group && typeof status.group === 'object') {
    if (status.group.slug && !props.params.groupSlug) {
      return <Redirect to={`/group/${status.group.slug}/posts/${props.params.statusId}`} />;
    }
  }

  const titleMessage = () => {
    if (status.visibility === 'direct') return messages.titleDirect;
    return messages.title;
  };

  return (
    <Column label={intl.formatMessage(titleMessage())}>
      <PullToRefresh onRefresh={handleRefresh}>
        <Stack space={2} className='mt-2'>
          <Thread status={status} next={next} handleLoadMore={handleLoadMore} />

          {!me && <ThreadLoginCta />}
        </Stack>
      </PullToRefresh>
    </Column>
  );
};

export default ThreadPage;
