import React from 'react';

interface IMoreMediaOverlay {
  count: number
}

/** Overlay on the final image in a gallery to indicate more images can be seen by clicking into the modal. */
const MoreMediaOverlay: React.FC<IMoreMediaOverlay> = ({ count }) => {
  return (
    <div className='pointer-events-none absolute inset-0 z-20 flex h-full w-full items-center justify-center bg-white/75 text-center text-5xl font-bold text-gray-900'>
      <span>+{count}</span>
    </div>
  );
};

export default MoreMediaOverlay;