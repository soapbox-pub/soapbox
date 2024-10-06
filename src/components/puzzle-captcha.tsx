import React, { useRef } from 'react';

interface IPuzzleCaptcha {
  bg: string;
  puzzle: string;
  position: { x: number; y: number };
  onChange(point: { x: number; y: number }): void;
}

export const PuzzleCaptcha: React.FC<IPuzzleCaptcha> = ({ bg, puzzle, position, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);

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

  const handlePointerUp = (e: React.PointerEvent<HTMLImageElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div ref={ref} className='relative'>
      <img
        className='absolute'
        src={puzzle}
        alt=''
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

      <img src={bg} alt='' draggable={false} />
    </div>
  );
};
