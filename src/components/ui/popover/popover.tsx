import {
  arrow,
  autoPlacement,
  FloatingArrow,
  offset,
  useClick,
  useDismiss,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import clsx from 'clsx';
import React, { useRef, useState } from 'react';

import Portal from '../portal/portal';

interface IPopover {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>
  /** The content of the popover */
  content: React.ReactNode
  /** Should we remove padding on the Popover */
  isFlush?: boolean
  /** Should the popover trigger via click or hover */
  interaction?: 'click' | 'hover'
  /** Add a class to the reference (trigger) element */
  referenceElementClassName?: string
}

/**
 * Popover
 *
 * Similar to tooltip, but requires a click and is used for larger blocks
 * of information.
 */
const Popover: React.FC<IPopover> = (props) => {
  const { children, content, referenceElementClassName, interaction = 'hover', isFlush = false } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const arrowRef = useRef<SVGSVGElement>(null);

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [
      autoPlacement({
        allowedPlacements: ['top', 'bottom'],
      }),
      offset(10),
      arrow({
        element: arrowRef,
      }),
    ],
  });

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

  const click = useClick(context, { enabled: interaction === 'click' });
  const hover = useHover(context, { enabled: interaction === 'hover' });
  const dismiss = useDismiss(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    hover,
    dismiss,
  ]);

  return (
    <>
      {React.cloneElement(children, {
        ref: refs.setReference,
        ...getReferenceProps(),
        className: clsx(children.props.className, referenceElementClassName),
      })}

      {(isMounted) && (
        <Portal>
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              ...styles,
            }}
            className={
              clsx({
                'z-40 rounded-lg bg-white shadow-2xl dark:bg-gray-900 dark:ring-2 dark:ring-primary-700': true,
                'p-6': !isFlush,
              })
            }
            {...getFloatingProps()}
          >
            {content}

            <FloatingArrow
              ref={arrowRef}
              context={context}
              className='-ml-2 fill-white dark:hidden' /** -ml-2 to fix offcenter arrow */
              tipRadius={3}
            />
          </div>
        </Portal>
      )}
    </>
  );
};

export default Popover;