import clsx from 'clsx';
import React, { useRef } from 'react';

interface IToggle extends Pick<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'name' | 'checked' | 'onChange' | 'required' | 'disabled'> {
  size?: 'sm' | 'md'
}

/** A glorified checkbox. */
const Toggle: React.FC<IToggle> = ({ id, size = 'md', name, checked = false, onChange, required, disabled }) => {
  const input = useRef<HTMLInputElement>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = () => {
    input.current?.focus();
    input.current?.click();
  };

  return (
    <button
      className={clsx('flex-none rounded-full focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:ring-gray-800 dark:ring-offset-0 dark:focus:ring-primary-500', {
        'bg-gray-500': !checked && !disabled,
        'bg-primary-600': checked && !disabled,
        'bg-gray-200': !checked && disabled,
        'bg-primary-200': checked && disabled,
        'w-9 p-0.5': size === 'sm',
        'w-11 p-0.5': size === 'md',
        'cursor-default': disabled,
      })}
      onClick={handleClick}
      type='button'
    >
      <div className={clsx('rounded-full bg-white transition-transform', {
        'h-4.5 w-4.5': size === 'sm',
        'translate-x-3.5': size === 'sm' && checked,
        'h-6 w-6': size === 'md',
        'translate-x-4': size === 'md' && checked,
      })}
      />

      <input
        id={id}
        ref={input}
        name={name}
        type='checkbox'
        className='sr-only'
        checked={checked}
        onChange={onChange}
        required={required}
        disabled={disabled}
        tabIndex={-1}
      />
    </button>
  );
};

export default Toggle;
