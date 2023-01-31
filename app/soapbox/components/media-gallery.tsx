import classNames from 'clsx';
import React, { useState, useRef, useLayoutEffect } from 'react';

import { Attachment } from 'soapbox/types/entities';

import { ATTACHMENT_LIMIT } from './media-gallery/constants';
import MediaItem from './media-gallery/media-item';
import { useMediaSizeData } from './media-gallery/useMediaSizeData';

import type { List as ImmutableList } from 'immutable';

interface IMediaGallery {
  sensitive?: boolean,
  media: ImmutableList<Attachment>,
  height?: number,
  onOpenMedia: (media: ImmutableList<Attachment>, index: number) => void,
  defaultWidth?: number,
  cacheWidth?: (width: number) => void,
  visible?: boolean,
  onToggleVisibility?: () => void,
  displayMedia?: string,
  compact: boolean,
}

const MediaGallery: React.FC<IMediaGallery> = (props) => {
  const {
    media,
    defaultWidth = 0,
    onOpenMedia,
    cacheWidth,
    compact,
    height,
  } = props;
  const [width, setWidth] = useState<number>(defaultWidth);

  const node = useRef<HTMLDivElement>(null);
  const sizeData = useMediaSizeData({ media, width, height, defaultWidth });

  const handleClick = (index: number) => {
    onOpenMedia(media, index);
  };

  const children = media.take(ATTACHMENT_LIMIT).map((attachment, i) => (
    <MediaItem
      key={attachment.id}
      onClick={handleClick}
      attachment={attachment}
      index={i}
      size={sizeData.size}
      displayWidth={sizeData.width}
      visible={!!props.visible}
      dimensions={sizeData.itemsDimensions[i]}
      last={i === ATTACHMENT_LIMIT - 1}
      total={media.size}
    />
  ));

  useLayoutEffect(() => {
    if (node.current) {
      const { offsetWidth } = node.current;

      if (cacheWidth) {
        cacheWidth(offsetWidth);
      }

      setWidth(offsetWidth);
    }
  }, [node.current]);

  return (
    <div className={classNames('media-gallery', { 'media-gallery--compact': compact })} style={sizeData.style} ref={node}>
      {children}
    </div>
  );
};

export default MediaGallery;
