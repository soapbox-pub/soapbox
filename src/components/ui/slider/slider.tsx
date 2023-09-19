import throttle from 'lodash/throttle';
import React, { useRef } from 'react';

type Point = { x: number, y: number };

interface ISlider {
  /** Value between 0 and 1. */
  value: number
  /** Callback when the value changes. */
  onChange(value: number): void
}

/** Draggable slider component. */
const Slider: React.FC<ISlider> = ({ value, onChange }) => {
  const node = useRef<HTMLDivElement>(null);

  const handleMouseDown: React.MouseEventHandler = e => {
    document.addEventListener('mousemove', handleMouseSlide, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('touchmove', handleMouseSlide, true);
    document.addEventListener('touchend', handleMouseUp, true);

    handleMouseSlide(e);

    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseSlide, true);
    document.removeEventListener('mouseup', handleMouseUp, true);
    document.removeEventListener('touchmove', handleMouseSlide, true);
    document.removeEventListener('touchend', handleMouseUp, true);
  };

  const handleMouseSlide = throttle(e => {
    if (node.current) {
      const { x } = getPointerPosition(node.current, e);

      if (!isNaN(x)) {
        let slideamt = x;

        if (x > 1) {
          slideamt = 1;
        } else if (x < 0) {
          slideamt = 0;
        }

        onChange(slideamt);
      }
    }
  }, 60);

  return (
    <div
      className='relative inline-flex h-6 cursor-pointer transition'
      onMouseDown={handleMouseDown}
      ref={node}
    >
      <div className='absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-primary-200 dark:bg-primary-700' />
      <div className='absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent-500' style={{ width: `${value * 100}%` }} />
      <span
        className='absolute top-1/2 z-10 -ml-1.5 h-3 w-3 -translate-y-1/2 rounded-full bg-accent-500 shadow'
        tabIndex={0}
        style={{ left: `${value * 100}%` }}
      />
    </div>
  );
};

const findElementPosition = (el: HTMLElement) => {
  let box;

  if (el.getBoundingClientRect && el.parentNode) {
    box = el.getBoundingClientRect();
  }

  if (!box) {
    return {
      left: 0,
      top: 0,
    };
  }

  const docEl = document.documentElement;
  const body  = document.body;

  const clientLeft = docEl.clientLeft || body.clientLeft || 0;
  const scrollLeft = window.pageXOffset || body.scrollLeft;
  const left       = (box.left + scrollLeft) - clientLeft;

  const clientTop = docEl.clientTop || body.clientTop || 0;
  const scrollTop = window.pageYOffset || body.scrollTop;
  const top       = (box.top + scrollTop) - clientTop;

  return {
    left: Math.round(left),
    top: Math.round(top),
  };
};


const getPointerPosition = (el: HTMLElement, event: MouseEvent & TouchEvent): Point => {
  const box = findElementPosition(el);
  const boxW = el.offsetWidth;
  const boxH = el.offsetHeight;
  const boxY = box.top;
  const boxX = box.left;

  let pageY = event.pageY;
  let pageX = event.pageX;

  if (event.changedTouches) {
    pageX = event.changedTouches[0].pageX;
    pageY = event.changedTouches[0].pageY;
  }

  return {
    y: Math.max(0, Math.min(1, (pageY - boxY) / boxH)),
    x: Math.max(0, Math.min(1, (pageX - boxX) / boxW)),
  };
};

export default Slider;