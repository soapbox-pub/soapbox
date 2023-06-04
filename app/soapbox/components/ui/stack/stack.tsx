import clsx from 'clsx';
import React from 'react';

const spaces = {
  0: 'space-y-0',
  [0.5]: 'space-y-0.5',
  1: 'space-y-1',
  [1.5]: 'space-y-1.5',
  2: 'space-y-2',
  3: 'space-y-3',
  4: 'space-y-4',
  5: 'space-y-5',
  6: 'space-y-6',
  9: 'space-y-9',
  10: 'space-y-10',
};

const justifyContentOptions = {
  between: 'justify-between',
  center: 'justify-center',
  end: 'justify-end',
};

const alignItemsOptions = {
  top: 'items-start',
  bottom: 'items-end',
  center: 'items-center',
  start: 'items-start',
  end: 'items-end',
};

interface IStack extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal alignment of children. */
  alignItems?: keyof typeof alignItemsOptions
  /** Extra class names on the element. */
  className?: string
  /** Vertical alignment of children. */
  justifyContent?: keyof typeof justifyContentOptions
  /** Size of the gap between elements. */
  space?: keyof typeof spaces
  /** Whether to let the flexbox grow. */
  grow?: boolean
  /** HTML element to use for container. */
  element?: keyof JSX.IntrinsicElements
}

/** Vertical stack of child elements. */
const Stack = React.forwardRef<HTMLDivElement, IStack>((props, ref: React.LegacyRef<HTMLDivElement> | undefined) => {
  const { space, alignItems, justifyContent, className, grow, element = 'div', ...filteredProps } = props;

  const Elem = element as 'div';

  return (
    <Elem
      {...filteredProps}
      ref={ref}
      className={clsx('flex flex-col', {
        // @ts-ignore
        [spaces[space]]: typeof space !== 'undefined',
        // @ts-ignore
        [alignItemsOptions[alignItems]]: typeof alignItems !== 'undefined',
        // @ts-ignore
        [justifyContentOptions[justifyContent]]: typeof justifyContent !== 'undefined',
        'grow': grow,
      }, className)}
    />
  );
});

export default Stack;
