import React from 'react';

import { useStatus } from 'soapbox/api/hooks';
import QuotedStatus from 'soapbox/components/quoted-status';
import Tombstone from 'soapbox/components/tombstone';

interface IQuotedStatusContainer {
  /** Status ID to the quoted status. */
  statusId: string
}

const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ statusId }) => {
  const { status } = useStatus(statusId);

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
