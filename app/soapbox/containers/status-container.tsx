import React, { useCallback } from 'react';

import Status, { IStatus } from 'soapbox/components/status';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

interface IStatusContainer extends Omit<IStatus, 'status'> {
  id: string
  contextType?: string
  /** @deprecated Unused. */
  otherAccounts?: any
  /** @deprecated Unused. */
  getScrollPosition?: any
  /** @deprecated Unused. */
  updateScrollBottom?: any
}

/**
 * Legacy Status wrapper accepting a status ID instead of the full entity.
 * @deprecated Use the Status component directly.
 */
const StatusContainer: React.FC<IStatusContainer> = (props) => {
  const { id, contextType, ...rest } = props;

  const getStatus = useCallback(makeGetStatus(), []);
  const status = useAppSelector(state => getStatus(state, { id, contextType }));

  if (status) {
    return <Status status={status} {...rest} />;
  } else {
    return null;
  }
};

export default StatusContainer;
