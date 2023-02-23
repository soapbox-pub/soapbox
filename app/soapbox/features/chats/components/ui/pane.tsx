import clsx from 'clsx';
import React from 'react';

interface IPane {
  /** Whether the pane is open or minimized. */
  isOpen: boolean
  /** Positions the pane on the screen, with 0 at the right. */
  index: number
  /** Children to display in the pane. */
  children: React.ReactNode
  /** Whether this is the main chat pane. */
  main?: boolean
}

/** Chat pane UI component for desktop. */
const Pane: React.FC<IPane> = ({ isOpen = false, index, children, main = false }) => {
  const right = (404 * index) + 20;

  return (
    <div
      className={clsx('fixed bottom-0 right-1 z-[99] flex w-96 flex-col rounded-t-lg bg-white shadow-3xl dark:bg-gray-900', {
        'h-[550px] max-h-[100vh]': isOpen,
        'h-16': !isOpen,
      })}
      style={{ right: `${right}px` }}
      data-testid='pane'
    >
      {children}
    </div>
  );
};

export { Pane };
