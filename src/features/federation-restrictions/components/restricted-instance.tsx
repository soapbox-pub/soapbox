import caretDownIcon from '@tabler/icons/outline/caret-down.svg';
import caretRightIcon from '@tabler/icons/outline/caret-right.svg';
import clsx from 'clsx';
import { useState } from 'react';

import Icon from 'soapbox/components/icon.tsx';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { makeGetRemoteInstance } from 'soapbox/selectors/index.ts';

import InstanceRestrictions from './instance-restrictions.tsx';

const getRemoteInstance = makeGetRemoteInstance();

interface IRestrictedInstance {
  host: string;
}

const RestrictedInstance: React.FC<IRestrictedInstance> = ({ host }) => {
  const remoteInstance: any = useAppSelector((state) => getRemoteInstance(state, host));

  const [expanded, setExpanded] = useState(false);

  const toggleExpanded: React.MouseEventHandler<HTMLAnchorElement> = e => {
    setExpanded((value) => !value);
    e.preventDefault();
  };

  return (
    <div>
      <a href='#' className='flex items-center gap-1 py-2.5 no-underline' onClick={toggleExpanded}>
        <Icon src={expanded ? caretDownIcon : caretRightIcon} />
        <div className={clsx({ 'line-through': remoteInstance.federation.reject })}>
          {remoteInstance.host}
        </div>
      </a>
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
