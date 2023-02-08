import clsx from 'clsx';
import React from 'react';

import ExtensionBadge from './extension-badge';

interface IStillVideo {
  src: string
  className?: string
  hoverToPlay?: boolean
  playbackRate?: number
  withExt?: boolean
}

/** Displays a frozen frame of a video unless hovered. */
const StillVideo: React.FC<IStillVideo> = ({
  src,
  className,
  hoverToPlay = true,
  playbackRate = 3,
  withExt = true,
}) => {
  // https://stackoverflow.com/a/4695156
  const ext = src.split('.').pop()?.toUpperCase();

  const handleMouseEnter: React.MouseEventHandler<HTMLVideoElement> = ({ currentTarget: video }) => {
    if (hoverToPlay) {
      video.playbackRate = playbackRate;
      video.play();
    }
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLVideoElement> = ({ currentTarget: video }) => {
    if (hoverToPlay) {
      video.pause();
    }
  };

  const handleClick: React.MouseEventHandler<HTMLVideoElement> = (e) => {
    e.preventDefault();
  };

  return (
    <div className={clsx(className, 'relative isolate overflow-hidden')}>
      <video
        className='h-full w-full object-cover'
        src={src}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        playsInline
        controls={false}
        muted
        loop
      />

      {(withExt && ext) && (
        <div className='pointer-events-none absolute left-2 bottom-2 opacity-90'>
          <ExtensionBadge ext={ext} />
        </div>
      )}
    </div>
  );
};

export default StillVideo;