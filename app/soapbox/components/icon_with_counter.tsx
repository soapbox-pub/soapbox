import React from 'react';

import Icon, { IIcon } from 'soapbox/components/icon';
import { Counter } from 'soapbox/components/ui';

interface IIconWithCounter extends React.HTMLAttributes<HTMLDivElement> {
  count: number,
  countMax?: number
  icon?: string;
  src?: string;
}

const IconWithCounter: React.FC<IIconWithCounter> = ({ icon, count, countMax, ...rest }) => {
  return (
    <div className='relative'>
      <Icon id={icon} {...rest as IIcon} />

      {count > 0 && (
        <i className='absolute -top-2 -right-3'>
          <Counter count={count} countMax={countMax} />
        </i>
      )}
    </div>
  );
};

export default IconWithCounter;
