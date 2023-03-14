import {
  arrow,
  FloatingArrow,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import React, { useRef, useState } from 'react';

interface IPopover {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>
  content: React.ReactNode
}

/**
 * Popover
 *
 * Similar to tooltip, but requires a click and is used for larger blocks
 * of information.
 */
const Popover: React.FC<IPopover> = (props) => {
  const { children, content } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const arrowRef = useRef<SVGSVGElement>(null);

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [
      offset(10),
      arrow({
        element: arrowRef,
      }),
    ],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { isMounted, styles } = useTransitionStyles(context, {
    initial: {
      opacity: 0,
      transform: 'scale(0.8)',
    },
    duration: {
      open: 200,
      close: 200,
    },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  return (
    <>
      {React.cloneElement(children, {
        ref: refs.setReference,
        ...getReferenceProps(),
        className: 'cursor-help',
      })}

      {(isMounted) && (
        <div
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            ...styles,
          }}
          className='rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-900 dark:ring-2 dark:ring-primary-700'
          {...getFloatingProps()}
        >
          {content}

          <FloatingArrow ref={arrowRef} context={context} className='fill-white dark:hidden' />
        </div>
      )}
    </>
  );
};

export default Popover;