import React from 'react';

import PlaceholderStatus from './placeholder-status';

/** Fake material status to display while data is loading. */
const PlaceholderMaterialStatus: React.FC = () => {
  return (
    <div className='pb-2.5' tabIndex={-1} aria-hidden>
      <div className='rounded-[10px] py-[15px] pb-[10px] shadow-[0_0_6px_0_rgba(0,0,0,0.1)]' tabIndex={0}>
        <PlaceholderStatus />
      </div>
    </div>
  );
};

export default PlaceholderMaterialStatus;
