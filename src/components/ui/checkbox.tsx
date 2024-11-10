import { forwardRef } from 'react';

interface ICheckbox extends Pick<React.InputHTMLAttributes<HTMLInputElement>, 'disabled' | 'id' | 'name' | 'onChange' | 'checked' | 'required'> { }

/** A pretty checkbox input. */
const Checkbox = forwardRef<HTMLInputElement, ICheckbox>((props, ref) => {
  return (
    <input
      {...props}
      ref={ref}
      type='checkbox'
      className='size-4 rounded border-2 border-gray-300 text-primary-600 focus:ring-primary-500 black:bg-black dark:border-gray-800 dark:bg-gray-900'
    />
  );
});

export default Checkbox;
