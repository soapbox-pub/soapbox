import React from 'react';

import { useStatus } from 'soapbox/api/hooks/statuses/useStatus';
import Status, { IStatus } from 'soapbox/components/status';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder-status';

interface IStatusContainer extends Omit<IStatus, 'status'> {
  id: string
  contextType?: string
}

/**  Status wrapper accepting a status ID instead of the full entity. */
const StatusContainer: React.FC<IStatusContainer> = ({ id, contextType, ...rest }) => {
  const { status, isLoading } = useStatus(id);
  if (status) {
    return <Status status={status} {...rest} />;
  } else if (isLoading) {
    return <PlaceholderStatus variant='default' />;
  } else {
    return null;
  }
};

export default StatusContainer;
