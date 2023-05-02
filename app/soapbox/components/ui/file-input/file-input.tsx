import React, { forwardRef } from 'react';

interface IFileInput extends Pick<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'required' | 'disabled' | 'name' | 'accept'> { }

const FileInput = forwardRef<HTMLInputElement, IFileInput>((props, ref) => {
  return (
    <input
      {...props}
      ref={ref}
      type='file'
      className='block w-full text-sm text-gray-800 file:mr-2 file:cursor-pointer file:rounded-full file:border file:border-solid file:border-gray-200 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:leading-4 file:text-gray-700 hover:file:bg-gray-100 dark:text-gray-200 dark:file:border-gray-800 dark:file:bg-gray-900 dark:file:text-gray-500 dark:file:hover:bg-gray-800'
    />
  );
});

export default FileInput;
