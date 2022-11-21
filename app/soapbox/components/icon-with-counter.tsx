import React from 'react';

import Icon, { IIcon } from 'soapbox/components/icon';
import { Counter } from 'soapbox/components/ui';

interface IIconWithCounter extends React.HTMLAttributes<HTMLDivElement> {
  count: number,
  icon?: string;
  src?: string;
}

const IconWithCounter: React.FC<IIconWithCounter> = ({ icon, count, ...rest }) => {
  return (
    <div className='relative'>
      <Icon id={icon} {...rest as IIcon} />

      {count > 0 && (
        <span className='absolute -top-2 -right-2'>
          <Counter count={count} />
        </span>
      )}
    </div>
  );
};

export default IconWithCounter;
