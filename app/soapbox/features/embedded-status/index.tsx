import React, { useEffect, useState } from 'react';

import { fetchStatus } from 'soapbox/actions/statuses';
import MissingIndicator from 'soapbox/components/missing_indicator';
import Status from 'soapbox/components/status';
import { Spinner } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { makeGetStatus } from 'soapbox/selectors';

interface IEmbeddedStatus {
  params: {
    statusId: string,
  },
}

const getStatus = makeGetStatus();

/** Status to be presented in an iframe for embeds on external websites. */
const EmbeddedStatus: React.FC<IEmbeddedStatus> = ({ params }) => {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => getStatus(state, { id: params.statusId }));

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchStatus(params.statusId))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  const renderInner = () => {
    if (loading) {
      return <Spinner />;
    } else if (status) {
      return <Status status={status} variant='default' />;
    } else {
      return <MissingIndicator nested />;
    }
  };

  return (
    <div className='bg-white dark:bg-gray-800 pointer-events-none'>
      <div className='p-4 sm:p-6 max-w-3xl'>
        {renderInner()}
      </div>
    </div>
  );
};

export default EmbeddedStatus;
