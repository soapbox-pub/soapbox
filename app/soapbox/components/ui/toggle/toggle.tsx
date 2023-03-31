import clsx from 'clsx';
import React, { useRef } from 'react';

interface IToggle extends Pick<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'checked' | 'onChange' | 'required'> {
  size?: 'sm' | 'md'
}

/** A glorified checkbox. Wrapper around react-toggle. */
const Toggle: React.FC<IToggle> = ({ id, size = 'md', checked, onChange, required }) => {
  const input = useRef<HTMLInputElement>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    input.current?.focus();
    input.current?.click();
  };

  return (
    <button
      className={clsx('flex-none rounded-full', {
        'bg-gray-500': !checked,
        'bg-primary-600': checked,
        'w-9 p-0.5': size === 'sm',
        'w-11 p-0.5': size === 'md',
      })}
      onClick={handleClick}
    >
      <div className={clsx('rounded-full bg-white transition-transform', {
        'h-4.5 w-4.5': size === 'sm',
        'translate-x-3': size === 'sm' && checked,
        'h-6 w-6': size === 'md',
        'translate-x-4': size === 'md' && checked,
      })}
      />

      <input
        id={id}
        ref={input}
        type='checkbox'
        className='sr-only'
        checked={checked}
        onChange={onChange}
        required={required}
      />
    </button>
  );
};

export default Toggle;
