import clsx from 'clsx';
import React from 'react';

interface IOutlineBox extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

/** Wraps children in a container with an outline. */
const OutlineBox: React.FC<IOutlineBox> = ({ children, className, ...rest }) => {
  return (
    <div
      className={clsx('rounded-lg border border-solid border-gray-300 p-4 dark:border-gray-800', className)}
      {...rest}
    >
      {children}
    </div>
  );
};

export default OutlineBox;
