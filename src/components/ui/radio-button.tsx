import { useMemo } from 'react';

import HStack from './hstack.tsx';

interface IRadioButton {
  value: string;
  checked?: boolean;
  name: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  label: React.ReactNode;
}

/**
 * A group for radio input with label.
 */
const RadioButton: React.FC<IRadioButton> = ({ name, value, checked, onChange, label }) => {
  const formFieldId: string = useMemo(() => `radio-${crypto.randomUUID()}`, []);

  return (
    <label htmlFor={formFieldId} className='cursor-pointer'>
      <HStack alignItems='center' space={3}>
        <input
          type='radio'
          name={name}
          id={formFieldId}
          value={value}
          checked={checked}
          onChange={onChange}
          className='size-4 cursor-pointer border-gray-300 text-primary-600 focus:ring-primary-500'
        />

        <span className='block text-sm font-medium text-gray-700'>
          {label}
        </span>
      </HStack>
    </label>
  );
};

export default RadioButton;
