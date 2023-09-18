import {
  arrow,
  FloatingArrow,
  FloatingPortal,
  offset,
  useFloating,
  useHover,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import React, { useRef, useState } from 'react';

interface ITooltip {
  /** Element to display the tooltip around. */
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>
  /** Text to display in the tooltip. */
  text: string
}

/**
 * Tooltip
 */
const Tooltip: React.FC<ITooltip> = (props) => {
  const { children, text } = props;

  const [isOpen, setIsOpen] = useState<boolean>(false);

  const arrowRef = useRef<SVGSVGElement>(null);

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'top',
    middleware: [
      offset(6),
      arrow({
        element: arrowRef,
      }),
    ],
  });

  const hover = useHover(context);
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
    hover,
  ]);

  return (
    <>
      {React.cloneElement(children, {
        ref: refs.setReference,
        ...getReferenceProps(),
      })}

      {(isMounted) && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              ...styles,
            }}
            className='pointer-events-none z-[100] whitespace-nowrap rounded bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-gray-100 shadow dark:bg-gray-100 dark:text-gray-900'
            {...getFloatingProps()}
          >
            {text}

            <FloatingArrow ref={arrowRef} context={context} className='fill-gray-800 dark:fill-gray-100' />
          </div>
        </FloatingPortal>
      )}
    </>
  );
};

export default Tooltip;