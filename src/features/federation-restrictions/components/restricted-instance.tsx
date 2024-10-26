import clsx from 'clsx';
import React, { useState } from 'react';

import { Button } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import { useAppSelector } from 'soapbox/hooks';
import { makeGetRemoteInstance } from 'soapbox/selectors';

import InstanceRestrictions from './instance-restrictions';

const getRemoteInstance = makeGetRemoteInstance();

interface IRestrictedInstance {
  host: string;
}

const RestrictedInstance: React.FC<IRestrictedInstance> = ({ host }) => {
  const remoteInstance: any = useAppSelector((state) => getRemoteInstance(state, host));

  const [expanded, setExpanded] = useState(false);

  const toggleExpanded: React.MouseEventHandler<HTMLButtonElement> = e => {
    setExpanded((value) => !value);
    e.preventDefault();
  };

  return (
    <div>
      <Button to='#' className='flex items-center gap-1  !border-none !px-0 !py-2.5 !text-primary-600 no-underline focus:!ring-transparent focus:!ring-offset-0 dark:!text-accent-blue' onClick={toggleExpanded}>
        <SvgIcon src={expanded ? require('@tabler/icons/outline/caret-down.svg') : require('@tabler/icons/outline/caret-right.svg')} />
        <div className={clsx({ 'line-through': remoteInstance.federation.reject })}>
          {remoteInstance.host}
        </div>
      </Button>
      <div
        className={clsx({
          'h-0 overflow-hidden': !expanded,
          'h-auto': expanded,
        })}
      >
        <InstanceRestrictions remoteInstance={remoteInstance} />
      </div>
    </div>
  );
};

export default RestrictedInstance;
