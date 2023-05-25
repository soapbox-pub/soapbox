import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';

import {
  fetchNext,
  fetchStatusWithContext,
} from 'soapbox/actions/statuses';
import MissingIndicator from 'soapbox/components/missing-indicator';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status';
import Thread from 'soapbox/features/status/components/thread';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

interface IThreadView {
  statusId: string
  visible: boolean
}

const ThreadView: React.FC<IThreadView> = ({ statusId, visible }) => {
  const dispatch = useAppDispatch();

  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector(state => getStatus(state, { id: statusId }));

  const [isLoaded, setIsLoaded] = useState<boolean>(!!status);
  const [next, setNext] = useState<string>();

  /** Fetch the status (and context) from the API. */
  const fetchData = async () => {
    const { next } = await dispatch(fetchStatusWithContext(statusId));
    setNext(next);
  };

  // Load data.
  useEffect(() => {
    fetchData().then(() => {
      setIsLoaded(true);
    }).catch(() => {
      setIsLoaded(true);
    });
  }, [statusId]);

  const handleLoadMore = useCallback(debounce(() => {
    if (next && status) {
      dispatch(fetchNext(statusId, next)).then(({ next }) => {
        setNext(next);
      }).catch(() => { });
    }
  }, 300, { leading: true }), [next, status]);

  if (!visible) return null;

  if (!status && isLoaded) {
    return (
      <MissingIndicator />
    );
  } else if (!status) {
    return (
      <div className='w-96 overflow-x-hidden bg-white p-4 dark:bg-primary-900'>
        <PlaceholderStatus />
      </div>
    );
  }

  return (
    <div className='w-96 overflow-x-hidden bg-white p-4 dark:bg-primary-900'>
      <Thread status={status} next={next} handleLoadMore={handleLoadMore} />
    </div>
  );
};

export default ThreadView;
