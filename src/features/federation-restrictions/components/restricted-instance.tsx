import caretDownIcon from '@tabler/icons/outline/caret-down.svg';
import caretRightIcon from '@tabler/icons/outline/caret-right.svg';
import clsx from 'clsx';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
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

  const toggleExpanded: React.MouseEventHandler<HTMLButtonElement> = e => {
    setExpanded((value) => !value);
    e.preventDefault();
  };

  return (
    <div>
      <Link to={'/'} className='inline-flex'>
        <button className='flex items-center gap-1 space-x-2 !border-none  !px-0 !py-2.5 !text-primary-600 no-underline focus:!ring-transparent focus:!ring-offset-0 dark:!text-accent-blue rtl:space-x-reverse' onClick={toggleExpanded}>
          <SvgIcon src={expanded ? caretDownIcon : caretRightIcon} />
          <div className={clsx({ 'line-through': remoteInstance.federation.reject })}>
            {remoteInstance.host}
          </div>
        </button>
      </Link>
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
