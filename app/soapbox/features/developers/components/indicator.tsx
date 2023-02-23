import clsx from 'clsx';
import React from 'react';

interface IIndicator {
  state?: 'active' | 'pending' | 'error' | 'inactive'
  size?: 'sm'
}

/** Indicator dot component. */
const Indicator: React.FC<IIndicator> = ({ state = 'inactive', size = 'sm' }) => {
  return (
    <div
      className={clsx('rounded-full outline-double', {
        'w-1.5 h-1.5 shadow-sm': size === 'sm',
        'bg-green-500 outline-green-400': state === 'active',
        'bg-yellow-500 outline-yellow-400': state === 'pending',
        'bg-red-500 outline-red-400': state === 'error',
        'bg-neutral-500 outline-neutral-400': state === 'inactive',
      })}
    />
  );
};

export default Indicator;
