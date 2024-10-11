import React, { useRef } from 'react';

interface IPuzzleCaptcha {
  bg: string;
  puzzle: string;
  position: { x: number; y: number };
  onChange(point: { x: number; y: number }): void;
}

export const PuzzleCaptcha: React.FC<IPuzzleCaptcha> = ({ bg, puzzle, position, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);

  const calculateNewPosition = (
    clientX: number,
    clientY: number,
    elementWidth: number,
    elementHeight: number,
    dropArea: DOMRect,
  ) => {
    const newX = Math.min(Math.max(clientX - dropArea.left - elementWidth / 2, 0), dropArea.width - elementWidth);
    const newY = Math.min(Math.max(clientY - dropArea.top - elementHeight / 2, 0), dropArea.height - elementHeight);
    return { x: newX, y: newY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dropArea = ref.current?.getBoundingClientRect();
    if (!dropArea) return;

    const newPosition = calculateNewPosition(e.clientX, e.clientY, e.currentTarget.width, e.currentTarget.height, dropArea);
    onChange(newPosition);
  };

  const handleTouchMove = (event: React.TouchEvent<HTMLImageElement>) => {
    const touch = event.touches[0];
    const dropArea = ref.current?.getBoundingClientRect();
    if (!dropArea) return;

    const newPosition = calculateNewPosition(touch.clientX, touch.clientY, 61, 61, dropArea);
    onChange(newPosition);
  };

  return (
    <div id='drop-area' ref={ref} className='relative'>
      <img
        className='drop-shadow-black absolute z-[101] w-[61px] drop-shadow-2xl hover:cursor-grab'
        src={puzzle}
        alt=''
        onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
        onPointerMove={handlePointerMove}
        onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
        onTouchMove={handleTouchMove}
        style={{
          filter: 'drop-shadow(2px 0 0 #fff) drop-shadow(0 2px 0 #fff) drop-shadow(-2px 0 0 #fff) drop-shadow(0 -2px 0 #fff)',
          left: position.x,
          top: position.y,
        }}
        draggable={false}
      />

      <img src={bg} alt='' className='rounded-2xl' draggable={false} />
    </div>
  );
};
