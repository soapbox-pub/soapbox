import classNames from 'classnames';
import React from 'react';

/** Chat pane state. */
export type WindowState = 'open' | 'minimized';

interface IPane {
  /** Whether the pane is open or minimized. */
  windowState: WindowState,
  /** Positions the pane on the screen, with 0 at the right. */
  index: number,
  /** Children to display in the pane. */
  children: React.ReactNode,
  /** Whether this is the main chat pane. */
  main?: boolean,
}

/** Chat pane UI component for desktop. */
const Pane: React.FC<IPane> = ({ windowState, index, children, main = false }) => {
  const right = (404 * index) + 20;

  return (
    <div
      className={classNames('flex flex-col shadow-3xl bg-white dark:bg-gray-900 rounded-t-lg fixed bottom-0 right-1 w-96 z-[1000]', {
        'h-[550px] max-h-[100vh]': windowState !== 'minimized',
        'h-16': windowState === 'minimized',
      })}
      style={{ right: `${right}px` }}
    >
      {children}
    </div>
  );
};

export { Pane };