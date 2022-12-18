import classNames from 'clsx';
import React from 'react';

import { HStack } from 'soapbox/components/ui';

type HSLKey = 'h' | 's' | 'l'

interface IHSLToggler {
  value: HSLKey
  onChange(key: HSLKey): void
}

/** Tiny 3-way toggler between H, S, an L.. */
const HSLToggler: React.FC<IHSLToggler> = ({ value, onChange }) => {
  return (
    <HStack space={1} className='px-1 py-0.5 bg-primary-200 dark:bg-primary-900 rounded-sm'>
      <HSLButton value='h' active={value === 'h'} onClick={onChange} />
      <HSLButton value='s' active={value === 's'} onClick={onChange} />
      <HSLButton value='l' active={value === 'l'} onClick={onChange} />
    </HStack>
  );
};

interface IHSLButton {
  active: boolean
  value: HSLKey
  onClick(key: HSLKey): void
}

const HSLButton: React.FC<IHSLButton> = ({ active, value, onClick }) => {
  const handleClick = () => {
    onClick(value);
  };

  return (
    <button
      type='button'
      className={classNames('px-1 rounded-sm text-xs', {
        'bg-primary-600 text-white': active,
        'text-black dark:text-white': !active,
      })}
      onClick={handleClick}
    >
      {value.toUpperCase()}
    </button>
  );
};

export default HSLToggler;