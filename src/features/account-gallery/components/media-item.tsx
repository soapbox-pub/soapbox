import eyeOffIcon from '@tabler/icons/outline/eye-off.svg';
import volumeIcon from '@tabler/icons/outline/volume.svg';
import clsx from 'clsx';
import { useState } from 'react';

import Blurhash from 'soapbox/components/blurhash';
import StillImage from 'soapbox/components/still-image';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import { useSettings } from 'soapbox/hooks';
import { isIOS } from 'soapbox/is-mobile';

import type { Attachment } from 'soapbox/types/entities';

interface IMediaItem {
  attachment: Attachment;
  onOpenMedia: (attachment: Attachment) => void;
}

const MediaItem: React.FC<IMediaItem> = ({ attachment, onOpenMedia }) => {
  const { autoPlayGif, displayMedia } = useSettings();
  const [visible, setVisible] = useState<boolean>(displayMedia !== 'hide_all' && !attachment.status?.sensitive || displayMedia === 'show_all');

  const handleMouseEnter: React.MouseEventHandler<HTMLVideoElement> = e => {
    const video = e.target as HTMLVideoElement;
    if (hoverToPlay()) {
      video.play();
    }
  };

  const handleMouseLeave: React.MouseEventHandler<HTMLVideoElement> = e => {
    const video = e.target as HTMLVideoElement;
    if (hoverToPlay()) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const hoverToPlay = () => {
    return !autoPlayGif && ['gifv', 'video'].includes(attachment.type);
  };

  const handleClick: React.MouseEventHandler = e => {
    if (e.button === 0 && !(e.ctrlKey || e.metaKey)) {
      e.preventDefault();

      if (visible) {
        onOpenMedia(attachment);
      } else {
        setVisible(true);
      }
    }
  };

  const status = attachment.status;
  const title  = status.spoiler_text || attachment.description;

  let thumbnail: React.ReactNode = '';
  let icon;

  if (attachment.type === 'unknown') {
    // Skip
  } else if (attachment.type === 'image') {
    const focusX = Number(attachment.meta.getIn(['focus', 'x'])) || 0;
    const focusY = Number(attachment.meta.getIn(['focus', 'y'])) || 0;
    const x = ((focusX /  2) + .5) * 100;
    const y = ((focusY / -2) + .5) * 100;

    thumbnail = (
      <StillImage
        src={attachment.preview_url}
        alt={attachment.description}
        style={{ objectPosition: `${x}% ${y}%` }}
        className='size-full overflow-hidden rounded-lg'
      />
    );
  } else if (['gifv', 'video'].indexOf(attachment.type) !== -1) {
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
    const remoteURL = attachment.remote_url || '';
    const fileExtensionLastIndex = remoteURL.lastIndexOf('.');
    const fileExtension = remoteURL.slice(fileExtensionLastIndex + 1).toUpperCase();
    thumbnail = (
      <div className='relative z-[1] block size-full cursor-zoom-in leading-none text-gray-400 no-underline'>
        <span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'><SvgIcon  className='size-24' src={volumeIcon} /></span>
        <span className='pointer-events-none absolute bottom-1.5 left-1.5 z-[1] block bg-black/50 px-1.5 py-0.5 text-[11px] font-semibold leading-[18px] text-white opacity-90 transition-opacity duration-100 ease-linear'>{fileExtension}</span>
      </div>
    );
  }

  if (!visible) {
    icon = (
      <span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2'>
        <SvgIcon className='size-24' src={eyeOffIcon} />
      </span>
    );
  }

  return (
    <div className='col-span-1'>
      <a className='relative z-[1] block aspect-1 size-full cursor-zoom-in leading-none text-gray-400 no-underline' href={status.url} target='_blank' onClick={handleClick} title={title}>
        <Blurhash
          hash={attachment.blurhash}
          className={clsx('absolute left-0 top-0 z-0 size-full rounded-lg bg-gray-200 object-cover dark:bg-gray-900', {
            'hidden': visible,
          })}
        />
        {visible && thumbnail}
        {!visible && icon}
      </a>
    </div>
  );
};

export default MediaItem;
