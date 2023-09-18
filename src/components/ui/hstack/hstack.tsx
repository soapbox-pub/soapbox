import clsx from 'clsx';
import React, { forwardRef } from 'react';

const justifyContentOptions = {
  between: 'justify-between',
  center: 'justify-center',
  start: 'justify-start',
  end: 'justify-end',
  around: 'justify-around',
};

const alignItemsOptions = {
  top: 'items-start',
  bottom: 'items-end',
  center: 'items-center',
  start: 'items-start',
  stretch: 'items-stretch',
};

const spaces = {
  0: 'space-x-0',
  [0.5]: 'space-x-0.5',
  1: 'space-x-1',
  1.5: 'space-x-1.5',
  2: 'space-x-2',
  2.5: 'space-x-2.5',
  3: 'space-x-3',
  4: 'space-x-4',
  5: 'space-x-5',
  6: 'space-x-6',
  8: 'space-x-8',
};

interface IHStack extends Pick<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  /** Vertical alignment of children. */
  alignItems?: keyof typeof alignItemsOptions
  /** Extra class names on the <div> element. */
  className?: string
  /** Children */
  children?: React.ReactNode
  /** Horizontal alignment of children. */
  justifyContent?: keyof typeof justifyContentOptions
  /** Size of the gap between elements. */
  space?: keyof typeof spaces
  /** Whether to let the flexbox grow. */
  grow?: boolean
  /** HTML element to use for container. */
  element?: keyof JSX.IntrinsicElements
  /** Extra CSS styles for the <div> */
  style?: React.CSSProperties
  /** Whether to let the flexbox wrap onto multiple lines. */
  wrap?: boolean
}

/** Horizontal row of child elements. */
const HStack = forwardRef<HTMLDivElement, IHStack>((props, ref) => {
  const { space, alignItems, justifyContent, className, grow, element = 'div', wrap, ...filteredProps } = props;

  const Elem = element as 'div';

  return (
    <Elem
      {...filteredProps}
      ref={ref}
      className={clsx('flex rtl:space-x-reverse', {
        // @ts-ignore
        [alignItemsOptions[alignItems]]: typeof alignItems !== 'undefined',
        // @ts-ignore
        [justifyContentOptions[justifyContent]]: typeof justifyContent !== 'undefined',
        // @ts-ignore
        [spaces[space]]: typeof space !== 'undefined',
        'grow': grow,
        'flex-wrap': wrap,
      }, className)}
    />
  );
});

export default HStack;
