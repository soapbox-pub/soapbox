import paperclipIcon from '@tabler/icons/outline/paperclip.svg';
import volumeIcon from '@tabler/icons/outline/volume.svg';
import clsx from 'clsx';
import React, { useState, useRef, useLayoutEffect, CSSProperties } from 'react';

import Blurhash from 'soapbox/components/blurhash';
import StillImage from 'soapbox/components/still-image';
import { MIMETYPE_ICONS } from 'soapbox/components/upload';
import { useSettings, useSoapboxConfig } from 'soapbox/hooks';
import { Attachment } from 'soapbox/types/entities';
import { truncateFilename } from 'soapbox/utils/media';

import { isIOS } from '../is-mobile';
import { isPanoramic, isPortrait, isNonConformingRatio, minimumAspectRatio, maximumAspectRatio } from '../utils/media-aspect-ratio';

import SvgIcon from './ui/icon/svg-icon';

import type { List as ImmutableList } from 'immutable';

// const Gameboy = React.lazy(() => import('./gameboy'));

const ATTACHMENT_LIMIT = 4;
const MAX_FILENAME_LENGTH = 45;

interface Dimensions {
  w: CSSProperties['width'];
  h: CSSProperties['height'];
  t?: CSSProperties['top'];
  r?: CSSProperties['right'];
  b?: CSSProperties['bottom'];
  l?: CSSProperties['left'];
  float?: CSSProperties['float'];
  pos?: CSSProperties['position'];
}

interface SizeData {
  style: CSSProperties;
  itemsDimensions: Dimensions[];
  size: number;
  width: number;
}

const withinLimits = (aspectRatio: number) => {
  return aspectRatio >= minimumAspectRatio && aspectRatio <= maximumAspectRatio;
};

const shouldLetterbox = (attachment: Attachment): boolean => {
  const aspectRatio = attachment.getIn(['meta', 'original', 'aspect']) as number | undefined;
  if (!aspectRatio) return true;

  return !withinLimits(aspectRatio);
};

interface IItem {
  attachment: Attachment;
  standalone?: boolean;
  index: number;
  size: number;
  onClick: (index: number) => void;
  displayWidth?: number;
  visible: boolean;
  dimensions: Dimensions;
  last?: boolean;
  total: number;
  compact?: boolean;
}

const Item: React.FC<IItem> = ({
  attachment,
  index,
  onClick,
  standalone = false,
  visible,
  dimensions,
  last,
  total,
  compact,
}) => {
  const { autoPlayGif } = useSettings();
  const { mediaPreview } = useSoapboxConfig();

  const handleMouseEnter: React.MouseEventHandler<HTMLVideoElement> = ({ currentTarget: video }) => {
    if (hoverToPlay()) {
      video.play();
    }
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLVideoElement> = ({ currentTarget: video }) => {
    if (hoverToPlay()) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const hoverToPlay = () => {
    return !autoPlayGif && attachment.type === 'gifv';
  };

  // FIXME: wtf?
  const handleClick: React.MouseEventHandler = (e: any) => {
    if (isIOS() && !e.target.autoPlay) {
      e.target.autoPlay = true;
      e.preventDefault();
    } else {
      if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
        if (hoverToPlay()) {
          e.target.pause();
          e.target.currentTime = 0;
        }
        e.preventDefault();
        onClick(index);
      }
    }

    e.stopPropagation();
  };

  const handleVideoHover = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    video.playbackRate = 3.0;
    video.play();
  };

  const handleVideoLeave = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.currentTarget;
    video.pause();
    video.currentTime = 0;
  };

  const handleFocus: React.FocusEventHandler<HTMLVideoElement> = handleVideoHover;
  const handleBlur: React.FocusEventHandler<HTMLVideoElement> = handleVideoLeave;

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

  let thumbnail: React.ReactNode = '';
  const ext = attachment.url.split('.').pop()?.toLowerCase();

  if (attachment.type === 'unknown') {
    const filename = truncateFilename(attachment.url, MAX_FILENAME_LENGTH);
    const attachmentIcon = (
      <SvgIcon
        className={clsx('size-16 text-gray-800 dark:text-gray-200', { 'size-8': compact })}
        src={MIMETYPE_ICONS[attachment.getIn(['pleroma', 'mime_type']) as string] || paperclipIcon}
      />
    );

    return (
      <div
        className={clsx('relative float-left box-border block overflow-hidden rounded-sm border-0', {
          standalone,
          'rounded-md': total > 1,
          '!size-[50px] !inset-auto !float-left !mr-[50px]': compact,
        })}
        key={attachment.id}
        style={{ position, float, left, top, right, bottom, height, width: `${width}%` }}
      >
        <a className='relative z-[1] block size-full cursor-zoom-in leading-none text-gray-400 no-underline' href={attachment.url} target='_blank' style={{ cursor: 'pointer' }}>
          <Blurhash hash={attachment.blurhash} className='absolute left-0 top-0 z-0 size-full rounded-lg bg-gray-200 object-cover dark:bg-gray-900' />
          <span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>{attachmentIcon}</span>
          <span className='pointer-events-none absolute bottom-1.5 left-1.5 z-[1] block bg-black/50 px-1.5 py-0.5 text-[11px] font-semibold leading-[18px] text-white opacity-90 transition-opacity duration-100 ease-linear'>{filename}</span>
        </a>
      </div>
    );
  } else if (attachment.type === 'image') {
    const letterboxed = total === 1 && shouldLetterbox(attachment);

    thumbnail = (
      <a
        className='relative z-[1] block size-full cursor-zoom-in leading-none text-gray-400 no-underline'
        href={attachment.url}
        onClick={handleClick}
        target='_blank'
      >
        <StillImage
          className='size-full'
          src={mediaPreview ? attachment.preview_url : attachment.url}
          alt={attachment.description}
          letterboxed={letterboxed}
          showExt
        />
      </a>
    );
  } else if (attachment.type === 'gifv') {
    const conditionalAttributes: React.VideoHTMLAttributes<HTMLVideoElement> = {};
    if (isIOS()) {
      conditionalAttributes.playsInline = true;
    }
    if (autoPlayGif) {
      conditionalAttributes.autoPlay = true;
    }

    thumbnail = (
      <div className='group relative size-full overflow-hidden'>
        <video
          className='relative top-0 z-10 size-full transform-none cursor-zoom-in rounded-md object-cover'
          aria-label={attachment.description}
          title={attachment.description}
          role='application'
          src={attachment.url}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          loop
          muted
          {...conditionalAttributes}
        />

        <span className={clsx('pointer-events-none absolute bottom-1.5 left-1.5 z-[1] block bg-black/50 px-1.5 py-0.5 text-[11px] font-semibold leading-[18px] text-white opacity-90 transition-opacity duration-100 ease-linear  group-hover:opacity-100', { 'hidden': autoPlayGif })}>GIF</span> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
      </div>
    );
  } else if (attachment.type === 'audio') {
    thumbnail = (
      <a
        className={clsx('relative z-[1] block size-full cursor-zoom-in leading-none text-gray-400 no-underline')}
        href={attachment.url}
        onClick={handleClick}
        target='_blank'
        title={attachment.description}
      >
        <span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'><SvgIcon className='size-24' src={volumeIcon} /></span>
        <span className={clsx('pointer-events-none absolute bottom-1.5 left-1.5 z-[1] block bg-black/50 px-1.5 py-0.5 text-[11px] font-semibold uppercase leading-[18px] text-white opacity-90 transition-opacity duration-100 ease-linear', { 'hidden': compact })}>{ext}</span>
      </a>
    );
  } else if (attachment.type === 'video') {
    thumbnail = (
      <a
        className={clsx('relative z-[1] block size-full cursor-zoom-in leading-none text-gray-400 no-underline')}
        href={attachment.url}
        onClick={handleClick}
        target='_blank'
        title={attachment.description}
      >
        <video
          className='size-full object-cover'
          muted
          loop
          onMouseOver={handleVideoHover}
          onMouseOut={handleVideoLeave}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <source src={attachment.url} />
        </video>
        <span className={clsx('pointer-events-none absolute bottom-1.5 left-1.5 z-[1] block bg-black/50 px-1.5 py-0.5 text-[11px] font-semibold uppercase leading-[18px] text-white opacity-90 transition-opacity duration-100 ease-linear', { 'hidden': compact })}>{ext}</span>
      </a>
    );
  }

  return (
    <div
      className={clsx('relative float-left box-border block overflow-hidden rounded-sm border-0', {
        standalone,
        'rounded-md': total > 1,
        '!size-[50px] !inset-auto !float-left !mr-[50px]': compact,
      })}
      key={attachment.id}
      style={{ position, float, left, top, right, bottom, height, width: `${width}%` }}
    >
      {last && total > ATTACHMENT_LIMIT && (
        <div className={clsx('pointer-events-none absolute inset-0 z-[2] flex size-full items-center justify-center bg-white/75 text-center text-[50px] font-bold text-gray-800', { '!text-5': compact })}> {/* eslint-disable-line formatjs/no-literal-string-in-jsx */}
          +{total - ATTACHMENT_LIMIT + 1}
        </div>
      )}
      <Blurhash
        hash={attachment.blurhash}
        className='absolute left-0 top-0 z-0 size-full rounded-lg bg-gray-200 object-cover dark:bg-gray-900'
      />
      {visible && thumbnail}
    </div>
  );
};

export interface IMediaGallery {
  sensitive?: boolean;
  media: ImmutableList<Attachment>;
  height?: number;
  onOpenMedia: (media: ImmutableList<Attachment>, index: number) => void;
  defaultWidth?: number;
  cacheWidth?: (width: number) => void;
  visible?: boolean;
  onToggleVisibility?: () => void;
  displayMedia?: string;
  compact?: boolean;
  className?: string;
}

const MediaGallery: React.FC<IMediaGallery> = (props) => {
  const {
    media,
    defaultWidth = 0,
    className,
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
    <Item
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
      compact={compact}
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
    <div
      className={clsx(className, 'relative isolate box-border h-auto w-full overflow-hidden rounded-lg', { '!h-[50px] bg-transparent': compact })}
      style={sizeData.style}
      ref={node}
    >
      {children}
    </div>
  );
};

export default MediaGallery;
