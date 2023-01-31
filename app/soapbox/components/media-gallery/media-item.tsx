import clsx from 'clsx';
import React from 'react';

import Blurhash from 'soapbox/components/blurhash';
import Icon from 'soapbox/components/icon';
import StillImage from 'soapbox/components/still-image';
import { MIMETYPE_ICONS } from 'soapbox/components/upload';
import { useSettings, useSoapboxConfig } from 'soapbox/hooks';
import { isIOS } from 'soapbox/is-mobile';
import { truncateFilename } from 'soapbox/utils/media';
import { shouldLetterbox } from 'soapbox/utils/media-aspect-ratio';

import { ATTACHMENT_LIMIT, MAX_FILENAME_LENGTH } from './constants';
import MediaItemThumbnail from './media-item-thumbnail';

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
  const settings = useSettings();
  const autoPlayGif = settings.get('autoPlayGif') === true;
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

  const handleVideoHover: React.MouseEventHandler<HTMLVideoElement> = ({ currentTarget: video }) => {
    video.playbackRate = 3.0;
    video.play();
  };

  const handleVideoLeave: React.MouseEventHandler<HTMLVideoElement> = ({ currentTarget: video }) => {
    video.pause();
    video.currentTime = 0;
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

  let thumbnail: React.ReactNode = '';

  if (attachment.type === 'unknown') {
    const filename = truncateFilename(attachment.url, MAX_FILENAME_LENGTH);
    const attachmentIcon = (
      <Icon
        className='h-16 w-16 text-gray-800 dark:text-gray-200'
        src={MIMETYPE_ICONS[attachment.getIn(['pleroma', 'mime_type']) as string] || require('@tabler/icons/paperclip.svg')}
      />
    );

    return (
      <div className={clsx('media-gallery__item', { standalone })} key={attachment.id} style={{ position, float, left, top, right, bottom, height, width: `${width}%` }}>
        <MediaItemThumbnail href={attachment.url} pointer>
          <Blurhash hash={attachment.blurhash} className='media-gallery__preview' />
          <span className='media-gallery__item__icons'>{attachmentIcon}</span>
          <span className='media-gallery__filename__label'>{filename}</span>
        </MediaItemThumbnail>
      </div>
    );
  } else if (attachment.type === 'image') {
    const aspectRatio = attachment.getIn(['meta', 'original', 'aspect']) as number | undefined;
    const letterboxed = total === 1 && shouldLetterbox(aspectRatio);

    thumbnail = (
      <MediaItemThumbnail
        href={attachment.url}
        onClick={handleClick}
      >
        <StillImage
          className='w-full h-full'
          src={mediaPreview ? attachment.preview_url : attachment.url}
          alt={attachment.description}
          letterboxed={letterboxed}
          showExt
        />
      </MediaItemThumbnail>
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
      <div className={clsx('media-gallery__gifv', { autoplay: autoPlayGif })}>
        <video
          className='media-gallery__item-gifv-thumbnail'
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

        <span className='media-gallery__gifv__label'>GIF</span>
      </div>
    );
  } else if (attachment.type === 'audio') {
    const ext = attachment.url.split('.').pop()?.toUpperCase();
    thumbnail = (
      <MediaItemThumbnail
        href={attachment.url}
        onClick={handleClick}
        title={attachment.description}
      >
        <span className='media-gallery__item__icons'><Icon src={require('@tabler/icons/volume.svg')} /></span>
        <span className='media-gallery__file-extension__label'>{ext}</span>
      </MediaItemThumbnail>
    );
  } else if (attachment.type === 'video') {
    const ext = attachment.url.split('.').pop()?.toUpperCase();
    thumbnail = (
      <MediaItemThumbnail
        href={attachment.url}
        onClick={handleClick}
        title={attachment.description}
      >
        <video
          muted
          loop
          onMouseOver={handleVideoHover}
          onMouseOut={handleVideoLeave}
        >
          <source src={attachment.url} />
        </video>
        <span className='media-gallery__file-extension__label'>{ext}</span>
      </MediaItemThumbnail>
    );
  }

  return (
    <div className={clsx('media-gallery__item', `media-gallery__item--${attachment.type}`, { standalone })} key={attachment.id} style={{ position, float, left, top, right, bottom, height, width: `${width}%` }}>
      {last && total > ATTACHMENT_LIMIT && (
        <div className='media-gallery__item-overflow'>
          +{total - ATTACHMENT_LIMIT + 1}
        </div>
      )}
      <Blurhash
        hash={attachment.blurhash}
        className='media-gallery__preview'
      />
      {visible && thumbnail}
    </div>
  );
};

export default MediaItem;