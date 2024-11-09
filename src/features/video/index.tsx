import arrowsMaximizeIcon from '@tabler/icons/outline/arrows-maximize.svg';
import arrowsMinimizeIcon from '@tabler/icons/outline/arrows-minimize.svg';
import playerPauseIcon from '@tabler/icons/outline/player-pause.svg';
import playerPlayIcon from '@tabler/icons/outline/player-play.svg';
import volume3Icon from '@tabler/icons/outline/volume-3.svg';
import volumeIcon from '@tabler/icons/outline/volume.svg';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Blurhash from 'soapbox/components/blurhash';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import { useIsMobile } from 'soapbox/hooks/useIsMobile';
import { isPanoramic, isPortrait, minimumAspectRatio, maximumAspectRatio } from 'soapbox/utils/media-aspect-ratio';

import { isFullscreen, requestFullscreen, exitFullscreen } from '../ui/util/fullscreen';

const DEFAULT_HEIGHT = 300;

type Position = { x: number; y: number };

const messages = defineMessages({
  play: { id: 'video.play', defaultMessage: 'Play' },
  pause: { id: 'video.pause', defaultMessage: 'Pause' },
  mute: { id: 'video.mute', defaultMessage: 'Mute sound' },
  unmute: { id: 'video.unmute', defaultMessage: 'Unmute sound' },
  fullscreen: { id: 'video.fullscreen', defaultMessage: 'Full screen' },
  exit_fullscreen: { id: 'video.exit_fullscreen', defaultMessage: 'Exit full screen' },
});

export const formatTime = (secondsNum: number): string => {
  let hours:   number | string = Math.floor(secondsNum / 3600);
  let minutes: number | string = Math.floor((secondsNum - (hours * 3600)) / 60);
  let seconds: number | string = secondsNum - (hours * 3600) - (minutes * 60);

  if (hours   < 10) hours   = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;
  if (seconds < 10) seconds = '0' + seconds;

  return (hours === '00' ? '' : `${hours}:`) + `${minutes}:${seconds}`;
};

export const findElementPosition = (el: HTMLElement) => {
  let box;

  if (el.getBoundingClientRect && el.parentNode) {
    box = el.getBoundingClientRect();
  }

  if (!box) {
    return {
      left: 0,
      top: 0,
    };
  }

  const docEl = document.documentElement;
  const body  = document.body;

  const clientLeft = docEl.clientLeft || body.clientLeft || 0;
  const scrollLeft = window.pageXOffset || body.scrollLeft;
  const left       = (box.left + scrollLeft) - clientLeft;

  const clientTop = docEl.clientTop || body.clientTop || 0;
  const scrollTop = window.pageYOffset || body.scrollTop;
  const top       = (box.top + scrollTop) - clientTop;

  return {
    left: Math.round(left),
    top: Math.round(top),
  };
};

export const getPointerPosition = (el: HTMLElement, event: MouseEvent & TouchEvent): Position => {
  const box = findElementPosition(el);
  const boxW = el.offsetWidth;
  const boxH = el.offsetHeight;
  const boxY = box.top;
  const boxX = box.left;

  let pageY = event.pageY;
  let pageX = event.pageX;

  if (event.changedTouches) {
    pageX = event.changedTouches[0].pageX;
    pageY = event.changedTouches[0].pageY;
  }

  return {
    y: Math.max(0, Math.min(1, (pageY - boxY) / boxH)),
    x: Math.max(0, Math.min(1, (pageX - boxX) / boxW)),
  };
};

export const fileNameFromURL = (str: string) => {
  const url      = new URL(str);
  const pathname = url.pathname;
  const index    = pathname.lastIndexOf('/');

  return pathname.substring(index + 1);
};

interface IVideo {
  preview?: string;
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  startTime?: number;
  detailed?: boolean;
  autoFocus?: boolean;
  inline?: boolean;
  cacheWidth?: (width: number) => void;
  visible?: boolean;
  blurhash?: string;
  link?: React.ReactNode;
  aspectRatio?: number;
  displayMedia?: string;
}

const Video: React.FC<IVideo> = ({
  width,
  visible = false,
  detailed = false,
  autoFocus = false,
  cacheWidth,
  startTime,
  src,
  height,
  alt,
  inline,
  aspectRatio = 16 / 9,
  link,
  blurhash,
}) => {
  const intl = useIntl();
  const isMobile = useIsMobile();

  const player = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const seek = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [preVolume, setPreVolume] = useState(0);
  const [paused, setPaused] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(width);
  const [fullscreen, setFullscreen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [volumeHovered, setVolumeHovered] = useState(false);
  const [seekHovered, setSeekHovered] = useState(false);
  const [muted, setMuted] = useState(false);
  const [buffer, setBuffer] = useState(0);

  const setDimensions = () => {
    if (player.current) {
      const { offsetWidth } = player.current;

      if (cacheWidth) {
        cacheWidth(offsetWidth);
      }

      setContainerWidth(offsetWidth);
    }
  };

  useLayoutEffect(() => {
    setDimensions();
  }, [player.current]);

  useEffect(() => {
    if (video.current) {
      setVolume(video.current.volume);
      setMuted(video.current.muted);
    }
  }, [video.current]);

  const handleClickRoot: React.MouseEventHandler = e => e.stopPropagation();

  const handlePlay = () => {
    setPaused(false);
  };

  const handlePause = () => {
    setPaused(true);
  };

  const handleTimeUpdate = () => {
    if (video.current) {
      setCurrentTime(Math.floor(video.current.currentTime));
      setDuration(Math.floor(video.current.duration));
    }
  };

  const handleVolumeMouseDown: React.MouseEventHandler = e => {
    document.addEventListener('mousemove', handleMouseVolSlide, true);
    document.addEventListener('mouseup', handleVolumeMouseUp, true);
    document.addEventListener('touchmove', handleMouseVolSlide, true);
    document.addEventListener('touchend', handleVolumeMouseUp, true);

    handleMouseVolSlide(e);

    e.preventDefault();
    e.stopPropagation();
  };

  const handleVolumeMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseVolSlide, true);
    document.removeEventListener('mouseup', handleVolumeMouseUp, true);
    document.removeEventListener('touchmove', handleMouseVolSlide, true);
    document.removeEventListener('touchend', handleVolumeMouseUp, true);
  };

  const handleMouseVolSlide = throttle(e => {
    if (slider.current) {
      const { x } = getPointerPosition(slider.current, e);

      if (!isNaN(x)) {
        let slideamt = x;

        if (x > 1) {
          slideamt = 1;
        } else if (x < 0) {
          slideamt = 0;
        }

        if (video.current) {
          video.current.volume = slideamt;
          const isMuted = slideamt <= 0;
          video.current.muted = isMuted;
          setMuted(isMuted);
        }

        setVolume(slideamt);
      }
    }
  }, 60);

  const handleMouseDown: React.MouseEventHandler = e => {
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('touchmove', handleMouseMove, true);
    document.addEventListener('touchend', handleMouseUp, true);

    setDragging(true);
    video.current?.pause();
    handleMouseMove(e);

    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove, true);
    document.removeEventListener('mouseup', handleMouseUp, true);
    document.removeEventListener('touchmove', handleMouseMove, true);
    document.removeEventListener('touchend', handleMouseUp, true);

    setDragging(false);
    video.current?.play();
  };

  const handleMouseMove = throttle(e => {
    if (seek.current && video.current) {
      const { x } = getPointerPosition(seek.current, e);
      const currentTime = Math.floor(video.current.duration * x);

      if (!isNaN(currentTime)) {
        video.current.currentTime = currentTime;
        setCurrentTime(currentTime);
      }
    }
  }, 60);

  const seekBy = (time: number) => {
    if (video.current) {
      const currentTime = video.current.currentTime + time;

      if (!isNaN(currentTime)) {
        setCurrentTime(currentTime);
        video.current.currentTime = currentTime;
      }
    }
  };

  const handleVideoKeyDown: React.KeyboardEventHandler = e => {
    // On the video element or the seek bar, we can safely use the space bar
    // for playback control because there are no buttons to press

    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      togglePlay();
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = e => {
    const frameTime = 1 / 25;

    switch (e.key) {
      case 'k':
        e.preventDefault();
        e.stopPropagation();
        togglePlay();
        break;
      case 'm':
        e.preventDefault();
        e.stopPropagation();
        toggleMute();
        break;
      case 'f':
        e.preventDefault();
        e.stopPropagation();
        toggleFullscreen();
        break;
      case 'j':
        e.preventDefault();
        e.stopPropagation();
        seekBy(-10);
        break;
      case 'l':
        e.preventDefault();
        e.stopPropagation();
        seekBy(10);
        break;
      case ',':
        e.preventDefault();
        e.stopPropagation();
        seekBy(-frameTime);
        break;
      case '.':
        e.preventDefault();
        e.stopPropagation();
        seekBy(frameTime);
        break;
    }

    // If we are in fullscreen mode, we don't want any hotkeys
    // interacting with the UI that's not visible
    if (fullscreen) {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        exitFullscreen();
      }
    }
  };

  const togglePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    setPaused(!paused);

    if (paused) {
      video.current?.play();
    } else {
      video.current?.pause();
    }
  };

  const toggleFullscreen = () => {
    if (isFullscreen()) {
      exitFullscreen();
    } else if (player.current) {
      requestFullscreen(player.current);
    }
  };

  const handleResize = useCallback(debounce(() => {
    setDimensions();
  }, 250, {
    trailing: true,
  }), [player.current, cacheWidth]);

  const handleScroll = useCallback(throttle(() => {
    if (!video.current) return;

    const { top, height } = video.current.getBoundingClientRect();
    const inView = (top <= (window.innerHeight || document.documentElement.clientHeight)) && (top + height >= 0);

    if (!paused && !inView) {
      setPaused(true);
      video.current.pause();
    }
  }, 150, { trailing: true }), [video.current, paused]);

  const handleFullscreenChange = useCallback(() => {
    setFullscreen(isFullscreen());
  }, []);

  const handleSeekEnter = () => {
    setSeekHovered(true);
  };

  const handleSeekLeave = () => {
    setSeekHovered(false);
  };

  const handleVolumeEnter = (e: React.MouseEvent) => {
    if (isMobile) return;

    setVolumeHovered(true);
  };

  const handleVolumeLeave = (e: React.MouseEvent) => {
    if (isMobile) return;

    setVolumeHovered(false);
  };

  const handleClickStart = () => {
    setHovered(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      setHovered(false);
    }, 2 * 1000);

  };

  const handleOnMouseMove = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    handleClickStart();
  };

  const toggleMute = () => {
    if (video.current) {
      const muted = !video.current.muted;
      setMuted(muted);
      video.current.muted = muted;

      if (muted) {
        setPreVolume(video.current.volume);
        video.current.volume = 0;
        setVolume(0);
      } else {
        video.current.volume = preVolume;
        setVolume(preVolume);
      }
    }
  };

  const handleLoadedData = () => {
    if (video.current && startTime) {
      video.current.currentTime = startTime;
      video.current.play();
    }
  };

  const handleProgress = () => {
    if (video.current && video.current.buffered.length > 0) {
      setBuffer(video.current.buffered.end(0) / video.current.duration * 100);
    }
  };

  const handleVolumeChange = () => {
    if (video.current) {
      setVolume(video.current.volume);
      setMuted(video.current.muted);
    }
  };

  const handleTogglePlay = () => {
    if (!isMobile || paused || hovered) togglePlay();
  };

  const progress = (currentTime / duration) * 100;
  const playerStyle: React.CSSProperties = {};

  const startTimeout = () => {
    timeoutRef.current = setTimeout(() => setHovered(false), 1000);
  };

  if (inline && containerWidth) {
    width = containerWidth;
    const minSize = containerWidth / (16 / 9);

    if (isPanoramic(aspectRatio)) {
      height = Math.max(Math.floor(containerWidth / maximumAspectRatio), minSize);
    } else if (isPortrait(aspectRatio)) {
      height = Math.max(Math.floor(containerWidth / minimumAspectRatio), minSize);
    } else {
      height = Math.floor(containerWidth / aspectRatio);
    }

    playerStyle.height = height || DEFAULT_HEIGHT;
  }

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange, true);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange, true);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange, true);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange, true);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      document.removeEventListener('fullscreenchange', handleFullscreenChange, true);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange, true);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange, true);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange, true);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      video.current?.pause();
    }
  }, [visible]);

  return (
    <div
      role='menuitem'
      className={clsx('relative box-border flex max-w-full overflow-hidden rounded-[10px] bg-black text-white focus:outline-0', { 'w-full h-full m-0': fullscreen })}
      style={playerStyle}
      ref={player}
      onClick={handleClickRoot}
      onMouseMove={handleOnMouseMove}
      onMouseOut={startTimeout}
      onBlur={startTimeout}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {!fullscreen && (
        <Blurhash hash={blurhash} className='absolute left-0 top-0 z-0 size-full rounded-lg bg-gray-200 object-cover dark:bg-gray-900' />
      )}

      <video
        ref={video}
        src={src}
        loop
        role='button'
        tabIndex={0}
        aria-label={alt}
        title={alt}
        className={clsx('relative z-10 block', {
          'max-h-full object-contain': inline && !fullscreen,
          'max-w-full max-h-full w-full h-full outline-none': fullscreen,
        })}
        width={width}
        height={height || DEFAULT_HEIGHT}
        onClick={handleTogglePlay}
        onKeyDown={handleVideoKeyDown}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onProgress={handleProgress}
        onVolumeChange={handleVolumeChange}
      />

      <div
        className={clsx('absolute inset-x-0 bottom-0 z-20 box-border bg-gradient-to-t from-black/70 to-transparent px-[15px] opacity-0 transition-opacity duration-100 ease-linear', { 'opacity-100': paused || hovered || volumeHovered })}
      >
        <div className='relative h-6 cursor-pointer' onMouseDown={handleMouseDown} onMouseEnter={handleSeekEnter} onMouseLeave={handleSeekLeave} ref={seek}>
          <div
            style={{
              content: '',
              width: '100%',
              background: 'rgba(255, 255, 255, 0.35)',
              borderRadius: '4px',
              display: 'block',
              position: 'absolute',
              height: '4px',
              top: '14px',
            }}
          />
          <div className='absolute top-3.5 block h-1 rounded-md bg-white/20' style={{ width: `${buffer}%` }} />
          <div className='absolute top-3.5 block h-1 rounded-md bg-accent-500' style={{ width: `${progress}%` }} />

          <span
            className={clsx('absolute top-2.5 z-30 -ml-1.5 size-3 rounded-full bg-accent-500 opacity-0 shadow-[1px_2px_6px_rgba(0,0,0,0.3)] transition-opacity duration-100', { 'opacity-100': dragging || seekHovered })}
            tabIndex={0}
            style={{ left: `${progress}%` }}
            onKeyDown={handleVideoKeyDown}
          />
        </div>

        <div className='my-[-5px] flex justify-between pb-2'>
          <div className='flex w-full flex-auto items-center truncate text-[16px]'>
            <button
              type='button'
              title={intl.formatMessage(paused ? messages.play : messages.pause)}
              aria-label={intl.formatMessage(paused ? messages.play : messages.pause)}
              className={clsx('inline-block flex-none border-0 bg-transparent px-[6px] py-[5px] text-[16px] text-white/75 opacity-75 outline-none hover:text-white hover:opacity-100 focus:text-white focus:opacity-100 active:text-white active:opacity-100 '
                , { 'py-[10px]': fullscreen })}
              onClick={togglePlay}
              autoFocus={autoFocus}
            >
              <SvgIcon className='w-[20px]' src={paused ? playerPlayIcon : playerPauseIcon} />
            </button>

            <button
              type='button'
              title={intl.formatMessage(muted ? messages.unmute : messages.mute)}
              aria-label={intl.formatMessage(muted ? messages.unmute : messages.mute)}
              onMouseEnter={handleVolumeEnter}
              onMouseLeave={handleVolumeLeave}
              className={clsx('inline-block flex-none border-0 bg-transparent px-[6px] py-[5px] text-[16px] text-white/75 opacity-75 outline-none hover:text-white hover:opacity-100 focus:text-white focus:opacity-100 active:text-white active:opacity-100 '
                , { 'py-[10px]': fullscreen })}
              onClick={toggleMute}
            >
              <SvgIcon className='w-[20px]' src={muted ? volume3Icon : volumeIcon} />
            </button>

            <div
              className={clsx('relative inline-flex h-6 flex-none cursor-pointer overflow-hidden transition-all duration-100 ease-linear', { 'overflow-visible w-[50px] mr-[16px]': volumeHovered })} onMouseDown={handleVolumeMouseDown} ref={slider}
              onMouseEnter={handleVolumeEnter}
              onMouseLeave={handleVolumeLeave}
            >
              <div
                className={clsx({ 'bottom-[27px]': fullscreen || detailed })}
                style={{
                  content: '',
                  width: '50px',
                  background: 'rgba(255, 255, 255, 0.35)',
                  borderRadius: '4px',
                  display: 'block',
                  position: 'absolute',
                  height: '4px',
                  left: '0',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <div className={clsx('absolute left-0 top-1/2 block h-1 -translate-y-1/2 rounded-md bg-accent-500', { 'bottom-[27px]': fullscreen || detailed })} style={{ width: `${volume * 100}%` }} />
              <span
                className={clsx('absolute left-0 top-1/2 z-30 -ml-1.5 size-3 -translate-y-1/2 rounded-full bg-accent-500 opacity-0 shadow-[1px_2px_6px_rgba(0,0,0,0.3)] transition-opacity duration-100', { 'opacity-100': volumeHovered, 'bottom-[23px]': fullscreen || detailed })}
                tabIndex={0}
                style={{ left: `${volume * 100}%` }}
              />
            </div>

            <span>
              <span className='text-sm font-medium text-white/75'>{formatTime(currentTime)}</span>
              {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
              <span className='mx-1.5 inline-block text-sm font-medium text-white/75'>/</span>
              <span className='text-sm font-medium text-white/75'>{formatTime(duration)}</span>
            </span>

            {link && (
              <span className='px-[2px] py-[10px] text-[14px] font-medium text-white no-underline hover:underline focus:underline active:underline'>
                {link}
              </span>
            )}
          </div>

          <div className='flex min-w-[30px] flex-auto items-center truncate text-[16px]'>
            <button
              type='button'
              title={intl.formatMessage(fullscreen ? messages.exit_fullscreen : messages.fullscreen)}
              aria-label={intl.formatMessage(fullscreen ? messages.exit_fullscreen : messages.fullscreen)}
              className={clsx('inline-block flex-none border-0 bg-transparent px-[6px] py-[5px] text-[16px] text-white/75 opacity-75 outline-none hover:text-white hover:opacity-100 focus:text-white focus:opacity-100 active:text-white active:opacity-100 '
                , { 'py-[10px]': fullscreen })}
              onClick={toggleFullscreen}
            >
              <SvgIcon className='w-[20px]' src={fullscreen ? arrowsMinimizeIcon : arrowsMaximizeIcon} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;