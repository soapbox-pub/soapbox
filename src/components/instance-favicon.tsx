import { useState } from 'react';
import { useHistory } from 'react-router-dom';

import type { Account as AccountSchema } from 'soapbox/schemas/index.ts';

interface IInstanceFavicon {
  account: AccountSchema;
  disabled?: boolean;
}

export const InstanceFavicon: React.FC<IInstanceFavicon> = ({ account, disabled }) => {
  const history = useHistory();
  const [missing, setMissing] = useState<boolean>(false);

  const handleError = () => setMissing(true);

  const handleClick: React.MouseEventHandler = (e) => {
    e.stopPropagation();

    if (disabled) return;

    const timelineUrl = `/timeline/${account.domain}`;
    if (!(e.ctrlKey || e.metaKey)) {
      history.push(timelineUrl);
    } else {
      window.open(timelineUrl, '_blank');
    }
  };

  if (missing || !account.pleroma?.favicon) {
    return null;
  }

  return (
    <button
      className='size-4 flex-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
      onClick={handleClick}
      disabled={disabled}
    >
      <img
        src={account.pleroma.favicon}
        alt=''
        title={account.domain}
        className='max-h-full w-full'
        onError={handleError}
      />
    </button>
  );
};