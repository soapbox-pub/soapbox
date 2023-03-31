import clsx from 'clsx';
import React, { useRef } from 'react';

interface IToggle extends Pick<React.InputHTMLAttributes<HTMLInputElement>, 'id' | 'checked' | 'onChange' | 'required'> {

}

/** A glorified checkbox. Wrapper around react-toggle. */
const Toggle: React.FC<IToggle> = ({ id, checked, onChange, required }) => {
  const input = useRef<HTMLInputElement>(null);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    input.current?.focus();
    input.current?.click();
  };

  return (
    <button
      className='w-9 rounded-full bg-gray-500 p-0.5'
      onClick={handleClick}
    >
      <div className={clsx('h-4.5 w-4.5 rounded-full bg-white transition-transform', { 'translate-x-3': checked })} />

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
