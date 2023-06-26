import React from 'react';

import { useStatus } from 'soapbox/api/hooks';
import Status, { IStatus } from 'soapbox/components/status';

interface IStatusContainer extends Omit<IStatus, 'status'> {
  id: string
  contextType?: string
}

/**
 * Legacy Status wrapper accepting a status ID instead of the full entity.
 * @deprecated Use the Status component directly.
 */
const StatusContainer: React.FC<IStatusContainer> = (props) => {
  const { id, ...rest } = props;
  const { status } = useStatus(id);

  if (status) {
    return <Status status={status} {...rest} />;
  } else {
    return null;
  }
};

export default StatusContainer;
