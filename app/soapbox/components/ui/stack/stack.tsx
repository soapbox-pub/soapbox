import classNames from 'clsx';
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
  10: 'space-y-10',
};

const justifyContentOptions = {
  center: 'justify-center',
  end: 'justify-end',
};

const alignItemsOptions = {
  center: 'items-center',
};

interface IStack extends React.HTMLAttributes<HTMLDivElement> {
  /** Size of the gap between elements. */
  space?: keyof typeof spaces
  /** Horizontal alignment of children. */
  alignItems?: 'center'
  /** Vertical alignment of children. */
  justifyContent?: keyof typeof justifyContentOptions
  /** Extra class names on the <div> element. */
  className?: string
  /** Whether to let the flexbox grow. */
  grow?: boolean
}

/** Vertical stack of child elements. */
const Stack = React.forwardRef<HTMLDivElement, IStack>((props, ref: React.LegacyRef<HTMLDivElement> | undefined) => {
  const { space, alignItems, justifyContent, className, grow, ...filteredProps } = props;

  return (
    <div
      {...filteredProps}
      ref={ref}
      className={classNames('flex flex-col', {
        // @ts-ignore
        [spaces[space]]: typeof space !== 'undefined',
        // @ts-ignore
        [alignItemsOptions[alignItems]]: typeof alignItems !== 'undefined',
        // @ts-ignore
        [justifyContentOptions[justifyContent]]: typeof justifyContent !== 'undefined',
        'flex-grow': grow,
      }, className)}
    />
  );
});

export default Stack;
