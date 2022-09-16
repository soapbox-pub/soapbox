import classNames from 'clsx';
import React from 'react';

interface IOutlineBox {
  children: React.ReactNode,
  className?: string,
}

/** Wraps children in a container with an outline. */
const OutlineBox: React.FC<IOutlineBox> = ({ children, className }) => {
  return (
    <div className={classNames('p-4 rounded-lg border border-solid border-gray-300 dark:border-gray-800', className)}>
      {children}
    </div>
  );
};

export default OutlineBox;