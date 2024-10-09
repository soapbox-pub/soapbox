import React, { useRef, useState } from 'react';

interface IPuzzleCaptcha {
  bg: string;
  puzzle: string;
  position: { x: number; y: number };
  onChange(point: { x: number; y: number }): void;
}

export const PuzzleCaptcha: React.FC<IPuzzleCaptcha> = ({ bg, puzzle, position, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [touchOffsetX, setTouchOffsetX] = useState(0);
  const [touchOffsetY, setTouchOffsetY] = useState(0);

  const handlePointerDown = (e: React.PointerEvent<HTMLImageElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const newPosition = {
      x: e.clientX - rect.left - e.currentTarget.width / 2,
      y: e.clientY - rect.top - e.currentTarget.height / 2,
    };

    onChange(newPosition);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLImageElement>) => {
    const imageElement = event.currentTarget.getBoundingClientRect();
    const touch = event.touches[0];

    const offsetX = touch.clientX - imageElement.left;
    const offsetY = touch.clientY - imageElement.top;

    setTouchOffsetX(offsetX);
    setTouchOffsetY(offsetY);
  };


  const handleTouchMove = (event: React.TouchEvent<HTMLImageElement>) => {
    const touch = event.touches[0];

    const dropArea = document.getElementById('drop-area')?.getBoundingClientRect();
    if (!dropArea) return;

    const newLeft = touch.clientX - dropArea.left - touchOffsetX;
    const newTop = touch.clientY - dropArea.top - touchOffsetY;

    const imageWidth = 61;
    const imageHeight = 61;
    const limitedLeft = Math.min(Math.max(newLeft, 0), dropArea.width - imageWidth);
    const limitedTop = Math.min(Math.max(newTop, 0), dropArea.height - imageHeight);

    onChange({ x: limitedLeft, y: limitedTop });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleTouchDrop = (event: React.TouchEvent<HTMLDivElement>) => {
    event.preventDefault();

    const dropArea = document.getElementById('drop-area')?.getBoundingClientRect();
    if (!dropArea) return;

    const touch = event.changedTouches[0];

    const newLeft = touch.clientX - dropArea.left - touchOffsetX;
    const newTop = touch.clientY - dropArea.top - touchOffsetY;

    const imageWidth = 61;
    const imageHeight = 61;

    const limitedLeft = Math.min(Math.max(newLeft, 0), dropArea.width - imageWidth);
    const limitedTop = Math.min(Math.max(newTop, 0), dropArea.height - imageHeight);

    onChange({ x: limitedLeft, y: limitedTop });

  };

  return (
    <div id='drop-area' ref={ref} className='relative' onTouchEnd={handleTouchDrop}>
      <img
        className='drop-shadow-black absolute z-[101] w-[61px] drop-shadow-2xl hover:cursor-grab'
        src={puzzle}
        alt=''
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
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
