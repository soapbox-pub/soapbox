import { useCallback } from 'react';

import QuotedStatus from 'soapbox/components/quoted-status.tsx';
import Tombstone from 'soapbox/components/tombstone.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { makeGetStatus } from 'soapbox/selectors/index.ts';

interface IQuotedStatusContainer {
  /** Status ID to the quoted status. */
  statusId: string;
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
