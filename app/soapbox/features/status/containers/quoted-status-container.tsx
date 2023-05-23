import React from 'react';

import QuotedStatus from 'soapbox/components/quoted-status';
import Tombstone from 'soapbox/components/tombstone';

import type { Status } from 'soapbox/schemas';

interface IQuotedStatusContainer {
  /** The quoted status. */
  status: Status
}

const QuotedStatusContainer: React.FC<IQuotedStatusContainer> = ({ status }) => {
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
