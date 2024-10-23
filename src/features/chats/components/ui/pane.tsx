import clsx from 'clsx';
import React from 'react';

interface IPane {
  /** Whether the pane is open or minimized. */
  isOpen: boolean;
  /** Children to display in the pane. */
  children: React.ReactNode;
}

/** Chat pane UI component for desktop. */
const Pane: React.FC<IPane> = ({ isOpen = false, children }) => {
  return (
    <div
      className={clsx('fixed bottom-0 z-[99] flex w-96 flex-col rounded-t-lg bg-white shadow-3xl black:border black:border-b-0 black:border-gray-800 black:bg-black dark:bg-gray-900 ltr:right-5 rtl:left-5', {
        'h-[550px] max-h-[100vh]': isOpen,
        'h-16': !isOpen,
      })}
      data-testid='pane'
    >
      {children}
    </div>
  );
};

export { Pane };
