import clsx from 'clsx';
import React from 'react';

import Blurhash from 'soapbox/components/blurhash';

import MediaPreview from '../media/media-preview';

import { ATTACHMENT_LIMIT } from './constants';
import MoreMediaOverlay from './more-media-overlay';

import type { Dimensions } from './types';
import type { Attachment } from 'soapbox/types/entities';

interface IMediaItem {
  attachment: Attachment,
  standalone?: boolean,
  index: number,
  size: number,
  onClick: (index: number) => void,
  displayWidth?: number,
  visible: boolean,
  dimensions: Dimensions,
  last?: boolean,
  total: number,
}

const MediaItem: React.FC<IMediaItem> = ({
  attachment,
  index,
  onClick,
  standalone = false,
  visible,
  dimensions,
  last,
  total,
}) => {
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    onClick(index);
    e.stopPropagation();
  };

  let width: Dimensions['w'] = 100;
  let height: Dimensions['h'] = '100%';
  let top: Dimensions['t'] = 'auto';
  let left: Dimensions['l'] = 'auto';
  let bottom: Dimensions['b'] = 'auto';
  let right: Dimensions['r'] = 'auto';
  let float: Dimensions['float'] = 'left';
  let position: Dimensions['pos'] = 'relative';

  if (dimensions) {
    width = dimensions.w;
    height = dimensions.h;
    top = dimensions.t || 'auto';
    right = dimensions.r || 'auto';
    bottom = dimensions.b || 'auto';
    left = dimensions.l || 'auto';
    float = dimensions.float || 'left';
    position = dimensions.pos || 'relative';
  }

  return (
    <div
      key={attachment.id}
      className={clsx('media-gallery__item', `media-gallery__item--${attachment.type}`, { standalone })}
      style={{ position, float, left, top, right, bottom, height, width: `${width}%` }}
    >
      {last && total > ATTACHMENT_LIMIT && (
        <MoreMediaOverlay
          count={total - ATTACHMENT_LIMIT + 1}
        />
      )}

      <Blurhash
        hash={attachment.blurhash}
        className='pointer-events-none absolute inset-0 -z-10 h-full w-full'
      />

      {visible && (
        <button
          onClick={handleClick}
          className='h-full w-full cursor-zoom-in'
        >
          <MediaPreview attachment={attachment} />
        </button>
      )}
    </div>
  );
};

export default MediaItem;