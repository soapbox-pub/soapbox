import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { fetchStatus } from 'soapbox/actions/statuses';
import MissingIndicator from 'soapbox/components/missing_indicator';
import SiteLogo from 'soapbox/components/site-logo';
import Status from 'soapbox/components/status';
import { Spinner } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { iframeId } from 'soapbox/iframe';
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
  const history = useHistory();
  const status = useAppSelector(state => getStatus(state, { id: params.statusId }));

  const [loading, setLoading] = useState(true);

  // Prevent navigation for UX and security.
  // https://stackoverflow.com/a/71531211
  history.block();

  useEffect(() => {
    dispatch(fetchStatus(params.statusId))
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.parent.postMessage({
      type: 'setHeight',
      id: iframeId,
      height: document.getElementsByTagName('html')[0].scrollHeight,
    }, '*');
  }, [status, loading]);

  const logo = (
    <div className='flex align-middle justify-center ml-4'>
      <SiteLogo className='max-h-[20px] max-w-[112px]' />
    </div>
  );

  const renderInner = () => {
    if (loading) {
      return <Spinner />;
    } else if (status) {
      return <Status status={status} accountAction={logo} variant='default' />;
    } else {
      return <MissingIndicator nested />;
    }
  };

  return (
    <a
      className='block bg-white dark:bg-primary-900'
      href={status?.url || '#'}
      onClick={e => e.stopPropagation()}
      target='_blank'
    >
      <div className='p-4 sm:p-6 max-w-3xl pointer-events-none'>
        {renderInner()}
      </div>
    </a>
  );
};

export default EmbeddedStatus;
