import { useCallback, useEffect, useState } from 'react';

import { fetchStatus } from 'soapbox/actions/statuses';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

interface UseStatusOpts {
  contextType?: string
  refetch?: boolean
}

/** Legacy Redux store status hook. */
function useStatus(id: string, opts: UseStatusOpts = {}) {
  const dispatch = useAppDispatch();
  const [isFetching, setIsFetching] = useState(false);

  const { contextType, refetch } = opts;

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector(state => getStatus(state, { id, contextType }));

  useEffect(() => {
    if (refetch) {
      setIsFetching(true);
      dispatch(fetchStatus(id))
        .then(() => setIsFetching(false))
        .catch(() => setIsFetching(false));
    }
  }, [refetch]);

  return {
    status,
    isFetching,
    isLoading: isFetching && !status,
  };
}

export { useStatus };