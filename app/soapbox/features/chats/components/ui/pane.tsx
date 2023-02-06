import clsx from 'clsx';
import React from 'react';

interface IPane {
  /** Whether the pane is open or minimized. */
  isOpen: boolean,
  /** Positions the pane on the screen, with 0 at the right. */
  index: number,
  /** Children to display in the pane. */
  children: React.ReactNode,
  /** Whether this is the main chat pane. */
  main?: boolean,
}

/** Chat pane UI component for desktop. */
const Pane: React.FC<IPane> = ({ isOpen = false, index, children, main = false }) => {
  const right = (404 * index) + 20;

  return (
    <div
      className={clsx('flex flex-col shadow-3xl bg-white dark:bg-gray-900 rounded-t-lg fixed bottom-0 right-1 w-96 z-[99]', {
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
