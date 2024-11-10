import { useMemo } from 'react';

import HStack from '../hstack/hstack.tsx';

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
    <HStack alignItems='center' space={3}>
      <input
        type='radio'
        name={name}
        id={formFieldId}
        value={value}
        checked={checked}
        onChange={onChange}
        className='size-4 border-gray-300 text-primary-600 focus:ring-primary-500'
      />

      <label htmlFor={formFieldId} className='block text-sm font-medium text-gray-700'>
        {label}
      </label>
    </HStack>
  );
};

export default RadioButton;
