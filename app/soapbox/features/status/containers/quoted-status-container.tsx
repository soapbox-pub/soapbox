import React, { useCallback } from 'react';

import QuotedStatus from 'soapbox/components/quoted-status';
import Tombstone from 'soapbox/components/tombstone';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

interface IQuotedStatusContainer {
  /** Status ID to the quoted status. */
  statusId: string
}

const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ statusId }) => {
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector(state => getStatus(state, { id: statusId }));

  if (!status) {
    return null;
  }

  if (status.tombstone) {
    return <Tombstone id={status.id} />;
  }

  return (
    <QuotedStatus
      status={status}
    />
  );
};

export default QuotedStatusContainer;
