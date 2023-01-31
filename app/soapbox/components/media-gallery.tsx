import classNames from 'clsx';
import React, { useState, useRef, useLayoutEffect } from 'react';

import { Attachment } from 'soapbox/types/entities';

import { isPanoramic, isPortrait, isNonConformingRatio, minimumAspectRatio, maximumAspectRatio } from '../utils/media-aspect-ratio';

import { ATTACHMENT_LIMIT } from './media-gallery/constants';
import MediaItem from './media-gallery/media-item';

import type { Dimensions, SizeData } from './media-gallery/types';
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

  const handleClick = (index: number) => {
    onOpenMedia(media, index);
  };

  const getSizeDataSingle = (): SizeData => {
    const w = width || defaultWidth;
    const aspectRatio = media.getIn([0, 'meta', 'original', 'aspect']) as number | undefined;

    const getHeight = () => {
      if (!aspectRatio) return w * 9 / 16;
      if (isPanoramic(aspectRatio)) return Math.floor(w / maximumAspectRatio);
      if (isPortrait(aspectRatio)) return Math.floor(w / minimumAspectRatio);
      return Math.floor(w / aspectRatio);
    };

    return {
      style: { height: getHeight() },
      itemsDimensions: [],
      size: 1,
      width,
    };
  };

  const getSizeDataMultiple = (size: number): SizeData => {
    const w = width || defaultWidth;
    const panoSize = Math.floor(w / maximumAspectRatio);
    const panoSize_px = `${Math.floor(w / maximumAspectRatio)}px`;

    const style: React.CSSProperties = {};
    let itemsDimensions: Dimensions[] = [];

    const ratios = Array(size).fill(null).map((_, i) =>
      media.getIn([i, 'meta', 'original', 'aspect']) as number,
    );

    const [ar1, ar2, ar3, ar4] = ratios;

    if (size === 2) {
      if (isPortrait(ar1) && isPortrait(ar2)) {
        style.height = w - (w / maximumAspectRatio);
      } else if (isPanoramic(ar1) && isPanoramic(ar2)) {
        style.height = panoSize * 2;
      } else if (
        (isPanoramic(ar1) && isPortrait(ar2)) ||
        (isPortrait(ar1) && isPanoramic(ar2)) ||
        (isPanoramic(ar1) && isNonConformingRatio(ar2)) ||
        (isNonConformingRatio(ar1) && isPanoramic(ar2))
      ) {
        style.height = (w * 0.6) + (w / maximumAspectRatio);
      } else {
        style.height = w / 2;
      }

      if (isPortrait(ar1) && isPortrait(ar2)) {
        itemsDimensions = [
          { w: 50, h: '100%', r: '2px' },
          { w: 50, h: '100%', l: '2px' },
        ];
      } else if (isPanoramic(ar1) && isPanoramic(ar2)) {
        itemsDimensions = [
          { w: 100, h: panoSize_px, b: '2px' },
          { w: 100, h: panoSize_px, t: '2px' },
        ];
      } else if (
        (isPanoramic(ar1) && isPortrait(ar2)) ||
        (isPanoramic(ar1) && isNonConformingRatio(ar2))
      ) {
        itemsDimensions = [
          { w: 100, h: `${(w / maximumAspectRatio)}px`, b: '2px' },
          { w: 100, h: `${(w * 0.6)}px`, t: '2px' },
        ];
      } else if (
        (isPortrait(ar1) && isPanoramic(ar2)) ||
        (isNonConformingRatio(ar1) && isPanoramic(ar2))
      ) {
        itemsDimensions = [
          { w: 100, h: `${(w * 0.6)}px`, b: '2px' },
          { w: 100, h: `${(w / maximumAspectRatio)}px`, t: '2px' },
        ];
      } else {
        itemsDimensions = [
          { w: 50, h: '100%', r: '2px' },
          { w: 50, h: '100%', l: '2px' },
        ];
      }
    } else if (size === 3) {
      if (isPanoramic(ar1) && isPanoramic(ar2) && isPanoramic(ar3)) {
        style.height = panoSize * 3;
      } else if (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3)) {
        style.height = Math.floor(w / minimumAspectRatio);
      } else {
        style.height = w;
      }

      if (isPanoramic(ar1) && isNonConformingRatio(ar2) && isNonConformingRatio(ar3)) {
        itemsDimensions = [
          { w: 100, h: '50%', b: '2px' },
          { w: 50, h: '50%', t: '2px', r: '2px' },
          { w: 50, h: '50%', t: '2px', l: '2px' },
        ];
      } else if (isPanoramic(ar1) && isPanoramic(ar2) && isPanoramic(ar3)) {
        itemsDimensions = [
          { w: 100, h: panoSize_px, b: '4px' },
          { w: 100, h: panoSize_px },
          { w: 100, h: panoSize_px, t: '4px' },
        ];
      } else if (isPortrait(ar1) && isNonConformingRatio(ar2) && isNonConformingRatio(ar3)) {
        itemsDimensions = [
          { w: 50, h: '100%', r: '2px' },
          { w: 50, h: '50%', b: '2px', l: '2px' },
          { w: 50, h: '50%', t: '2px', l: '2px' },
        ];
      } else if (isNonConformingRatio(ar1) && isNonConformingRatio(ar2) && isPortrait(ar3)) {
        itemsDimensions = [
          { w: 50, h: '50%', b: '2px', r: '2px' },
          { w: 50, h: '50%', l: '-2px', b: '-2px', pos: 'absolute', float: 'none' },
          { w: 50, h: '100%', r: '-2px', t: '0px', b: '0px', pos: 'absolute', float: 'none' },
        ];
      } else if (
        (isNonConformingRatio(ar1) && isPortrait(ar2) && isNonConformingRatio(ar3)) ||
        (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3))
      ) {
        itemsDimensions = [
          { w: 50, h: '50%', b: '2px', r: '2px' },
          { w: 50, h: '100%', l: '2px', float: 'right' },
          { w: 50, h: '50%', t: '2px', r: '2px' },
        ];
      } else if (
        (isPanoramic(ar1) && isPanoramic(ar2) && isNonConformingRatio(ar3)) ||
        (isPanoramic(ar1) && isPanoramic(ar2) && isPortrait(ar3))
      ) {
        itemsDimensions = [
          { w: 50, h: panoSize_px, b: '2px', r: '2px' },
          { w: 50, h: panoSize_px, b: '2px', l: '2px' },
          { w: 100, h: `${w - panoSize}px`, t: '2px' },
        ];
      } else if (
        (isNonConformingRatio(ar1) && isPanoramic(ar2) && isPanoramic(ar3)) ||
        (isPortrait(ar1) && isPanoramic(ar2) && isPanoramic(ar3))
      ) {
        itemsDimensions = [
          { w: 100, h: `${w - panoSize}px`, b: '2px' },
          { w: 50, h: panoSize_px, t: '2px', r: '2px' },
          { w: 50, h: panoSize_px, t: '2px', l: '2px' },
        ];
      } else {
        itemsDimensions = [
          { w: 50, h: '50%', b: '2px', r: '2px' },
          { w: 50, h: '50%', b: '2px', l: '2px' },
          { w: 100, h: '50%', t: '2px' },
        ];
      }
    } else if (size >= 4) {
      if (
        (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3) && isPortrait(ar4)) ||
        (isPortrait(ar1) && isPortrait(ar2) && isPortrait(ar3) && isNonConformingRatio(ar4)) ||
        (isPortrait(ar1) && isPortrait(ar2) && isNonConformingRatio(ar3) && isPortrait(ar4)) ||
        (isPortrait(ar1) && isNonConformingRatio(ar2) && isPortrait(ar3) && isPortrait(ar4)) ||
        (isNonConformingRatio(ar1) && isPortrait(ar2) && isPortrait(ar3) && isPortrait(ar4))
      ) {
        style.height = Math.floor(w / minimumAspectRatio);
      } else if (isPanoramic(ar1) && isPanoramic(ar2) && isPanoramic(ar3) && isPanoramic(ar4)) {
        style.height = panoSize * 2;
      } else if (
        (isPanoramic(ar1) && isPanoramic(ar2) && isNonConformingRatio(ar3) && isNonConformingRatio(ar4)) ||
        (isNonConformingRatio(ar1) && isNonConformingRatio(ar2) && isPanoramic(ar3) && isPanoramic(ar4))
      ) {
        style.height = panoSize + (w / 2);
      } else {
        style.height = w;
      }

      if (isPanoramic(ar1) && isPanoramic(ar2) && isNonConformingRatio(ar3) && isNonConformingRatio(ar4)) {
        itemsDimensions = [
          { w: 50, h: panoSize_px, b: '2px', r: '2px' },
          { w: 50, h: panoSize_px, b: '2px', l: '2px' },
          { w: 50, h: `${(w / 2)}px`, t: '2px', r: '2px' },
          { w: 50, h: `${(w / 2)}px`, t: '2px', l: '2px' },
        ];
      } else if (isNonConformingRatio(ar1) && isNonConformingRatio(ar2) && isPanoramic(ar3) && isPanoramic(ar4)) {
        itemsDimensions = [
          { w: 50, h: `${(w / 2)}px`, b: '2px', r: '2px' },
          { w: 50, h: `${(w / 2)}px`, b: '2px', l: '2px' },
          { w: 50, h: panoSize_px, t: '2px', r: '2px' },
          { w: 50, h: panoSize_px, t: '2px', l: '2px' },
        ];
      } else if (
        (isPortrait(ar1) && isNonConformingRatio(ar2) && isNonConformingRatio(ar3) && isNonConformingRatio(ar4)) ||
        (isPortrait(ar1) && isPanoramic(ar2) && isPanoramic(ar3) && isPanoramic(ar4))
      ) {
        itemsDimensions = [
          { w: 67, h: '100%', r: '2px' },
          { w: 33, h: '33%', b: '4px', l: '2px' },
          { w: 33, h: '33%', l: '2px' },
          { w: 33, h: '33%', t: '4px', l: '2px' },
        ];
      } else {
        itemsDimensions = [
          { w: 50, h: '50%', b: '2px', r: '2px' },
          { w: 50, h: '50%', b: '2px', l: '2px' },
          { w: 50, h: '50%', t: '2px', r: '2px' },
          { w: 50, h: '50%', t: '2px', l: '2px' },
        ];
      }
    }

    return {
      style,
      itemsDimensions,
      size,
      width: w,
    };
  };

  const getSizeData = (size: number): Readonly<SizeData> => {
    const w = width || defaultWidth;

    if (w) {
      if (size === 1) return getSizeDataSingle();
      if (size > 1) return getSizeDataMultiple(size);
    }

    return {
      style: { height },
      itemsDimensions: [],
      size,
      width: w,
    };
  };

  const sizeData: SizeData = getSizeData(media.size);

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
