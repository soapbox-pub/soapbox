import React from 'react';

interface IMoreMediaOverlay {
  count: number
}

/** Overlay on the final image in a gallery to indicate more images can be seen by clicking into the modal. */
const MoreMediaOverlay: React.FC<IMoreMediaOverlay> = ({ count }) => {
  return (
    <div className='absolute w-full h-full inset-0 bg-white/75 z-20 text-gray-900 text-center font-bold text-5xl flex items-center justify-center pointer-events-none'>
      <span>+{count}</span>
    </div>
  );
};

export default MoreMediaOverlay;