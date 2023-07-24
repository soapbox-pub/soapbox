import clsx from 'clsx';
import debounce from 'lodash/debounce';
import throttle from 'lodash/throttle';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Icon from 'soapbox/components/icon';
import { formatTime, getPointerPosition } from 'soapbox/features/video';

import Visualizer from './visualizer';

const messages = defineMessages({
  play: { id: 'video.play', defaultMessage: 'Play' },
  pause: { id: 'video.pause', defaultMessage: 'Pause' },
  mute: { id: 'video.mute', defaultMessage: 'Mute sound' },
  unmute: { id: 'video.unmute', defaultMessage: 'Unmute sound' },
  download: { id: 'video.download', defaultMessage: 'Download file' },
});

const TICK_SIZE = 10;
const PADDING   = 180;

interface IAudio {
  src: string
  alt?: string
  poster?: string
  duration?: number
  width?: number
  height?: number
  editable?: boolean
  fullscreen?: boolean
  cacheWidth?: (width: number) => void
  backgroundColor?: string
  foregroundColor?: string
  accentColor?: string
  currentTime?: number
  autoPlay?: boolean
  volume?: number
  muted?: boolean
  deployPictureInPicture?: (type: string, opts: Record<string, any>) => void
}

const Audio: React.FC<IAudio> = (props) => {
  const {
    src,
    alt = '',
    poster,
    accentColor,
    backgroundColor,
    foregroundColor,
    cacheWidth,
    fullscreen,
    autoPlay,
    editable,
    deployPictureInPicture = false,
  } = props;

  const intl = useIntl();

  const [width, setWidth] = useState<number | undefined>(props.width);
  const [height, setHeight] = useState<number | undefined>(props.height);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [duration, setDuration] = useState<number | undefined>(undefined);
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);

  const visualizer = useRef<Visualizer>(new Visualizer(TICK_SIZE));
  const audioContext = useRef<AudioContext | null>(null);

  const player = useRef<HTMLDivElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const seek = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const _pack = () => ({
    src: props.src,
    volume: audio.current?.volume,
    muted: audio.current?.muted,
    currentTime: audio.current?.currentTime,
    poster: props.poster,
    backgroundColor: props.backgroundColor,
    foregroundColor: props.foregroundColor,
    accentColor: props.accentColor,
  });

  const _setDimensions = () => {
    if (player.current) {
      const width  = player.current.offsetWidth;
      const height = fullscreen ? player.current.offsetHeight : (width / (16 / 9));

      if (cacheWidth) {
        cacheWidth(width);
      }

      setWidth(width);
      setHeight(height);
    }
  };

  const togglePlay = () => {
    if (!audioContext.current) {
      _initAudioContext();
    }

    if (paused) {
      audio.current?.play();
    } else {
      audio.current?.pause();
    }

    setPaused(!paused);
  };

  const handleResize = debounce(() => {
    if (player.current) {
      _setDimensions();
    }
  }, 250, {
    trailing: true,
  });

  const handlePlay = () => {
    setPaused(false);

    if (audioContext.current?.state === 'suspended') {
      audioContext.current?.resume();
    }

    _renderCanvas();
  };

  const handlePause = () => {
    setPaused(true);
    audioContext.current?.suspend();
  };

  const handleProgress = () => {
    if (audio.current) {
      const lastTimeRange = audio.current.buffered.length - 1;

      if (lastTimeRange > -1) {
        setBuffer(Math.ceil(audio.current.buffered.end(lastTimeRange) / audio.current.duration * 100));
      }
    }
  };

  const toggleMute = () => {
    const nextMuted = !muted;

    setMuted(nextMuted);

    if (audio.current) {
      audio.current.muted = nextMuted;
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

  const handleMouseDown: React.MouseEventHandler = e => {
    document.addEventListener('mousemove', handleMouseMove, true);
    document.addEventListener('mouseup', handleMouseUp, true);
    document.addEventListener('touchmove', handleMouseMove, true);
    document.addEventListener('touchend', handleMouseUp, true);

    setDragging(true);
    audio.current?.pause();
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
    audio.current?.play();
  };

  const handleMouseMove = throttle((e) => {
    if (audio.current && seek.current) {
      const { x } = getPointerPosition(seek.current, e);
      const currentTime = audio.current.duration * x;

      if (!isNaN(currentTime)) {
        setCurrentTime(currentTime);
        audio.current.currentTime = currentTime;
      }
    }
  }, 15);

  const handleTimeUpdate = () => {
    if (audio.current) {
      setCurrentTime(audio.current.currentTime);
      setDuration(audio.current.duration);
    }
  };

  const handleMouseVolSlide = throttle(e => {
    if (audio.current && slider.current) {
      const { x } = getPointerPosition(slider.current, e);

      if (!isNaN(x)) {
        setVolume(x);
        audio.current.volume = x;
      }
    }
  }, 15);

  const handleScroll = throttle(() => {
    if (!canvas.current || !audio.current) {
      return;
    }

    const { top, height } = canvas.current.getBoundingClientRect();
    const inView = (top <= (window.innerHeight || document.documentElement.clientHeight)) && (top + height >= 0);

    if (!paused && !inView) {
      audio.current.pause();

      if (deployPictureInPicture) {
        deployPictureInPicture('audio', _pack());
      }

      setPaused(true);
    }
  }, 150, { trailing: true });

  const handleMouseEnter = () => {
    setHovered(true);
  };

  const handleMouseLeave = () => {
    setHovered(false);
  };

  const handleLoadedData = () => {
    if (audio.current) {
      setDuration(audio.current.duration);

      if (currentTime) {
        audio.current.currentTime = currentTime;
      }

      if (volume !== undefined) {
        audio.current.volume = volume;
      }

      if (muted !== undefined) {
        audio.current.muted = muted;
      }

      if (autoPlay) {
        togglePlay();
      }
    }
  };

  const _initAudioContext = () => {
    if (audio.current) {
      // @ts-ignore
      // eslint-disable-next-line compat/compat
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const context      = new AudioContext();
      const source       = context.createMediaElementSource(audio.current);

      visualizer.current.setAudioContext(context, source);
      source.connect(context.destination);

      audioContext.current = context;
    }
  };

  const _renderCanvas = () => {
    requestAnimationFrame(() => {
      if (!audio.current) return;

      handleTimeUpdate();
      _clear();
      _draw();

      if (!paused) {
        _renderCanvas();
      }
    });
  };

  const _clear = () => {
    visualizer.current?.clear(width || 0, height || 0);
  };

  const _draw = () => {
    visualizer.current?.draw(_getCX(), _getCY(), _getAccentColor(), _getRadius(), _getScaleCoefficient());
  };

  const _getRadius = (): number => {
    return ((height || props.height || 0) - (PADDING * _getScaleCoefficient()) * 2) / 2;
  };

  const _getScaleCoefficient = (): number => {
    return (height || props.height || 0) / 982;
  };

  const _getCX = (): number => {
    return Math.floor((width || 0) / 2);
  };

  const _getCY = (): number => {
    return Math.floor(_getRadius() + (PADDING * _getScaleCoefficient()));
  };

  const _getAccentColor = (): string => {
    return accentColor || '#ffffff';
  };

  const _getBackgroundColor = (): string => {
    return backgroundColor || '#000000';
  };

  const _getForegroundColor = (): string => {
    return foregroundColor || '#ffffff';
  };

  const seekBy = (time: number) => {
    if (audio.current) {
      const currentTime = audio.current.currentTime + time;

      if (!isNaN(currentTime)) {
        setCurrentTime(currentTime);
        audio.current.currentTime = currentTime;
      }
    }
  };

  const handleAudioKeyDown: React.KeyboardEventHandler = e => {
    // On the audio element or the seek bar, we can safely use the space bar
    // for playback control because there are no buttons to press

    if (e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      togglePlay();
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = e => {
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
    }
  };

  const getDuration = () => duration || props.duration || 0;

  const progress = Math.min((currentTime / getDuration()) * 100, 100);

  useLayoutEffect(() => {
    if (player.current) {
      _setDimensions();
    }
  }, [player.current]);

  useEffect(() => {
    if (audio.current) {
      setVolume(audio.current.volume);
      setMuted(audio.current.muted);
    }
  }, [audio.current]);

  useEffect(() => {
    if (canvas.current && visualizer.current) {
      visualizer.current.setCanvas(canvas.current);
    }
  }, [canvas.current, visualizer.current]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      if (!paused && audio.current && deployPictureInPicture) {
        deployPictureInPicture('audio', _pack());
      }
    };
  }, []);

  useEffect(() => {
    _clear();
    _draw();
  }, [src, width, height, accentColor]);

  return (
    <div
      className={clsx('audio-player', { editable })}
      ref={player}
      style={{
        backgroundColor: _getBackgroundColor(),
        color: _getForegroundColor(),
        width: '100%',
        height: fullscreen ? '100%' : (height || props.height),
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={e => e.stopPropagation()}
    >
      <audio
        src={src}
        ref={audio}
        preload='auto'
        onPlay={handlePlay}
        onPause={handlePause}
        onProgress={handleProgress}
        onLoadedData={handleLoadedData}
        crossOrigin='anonymous'
      />

      <canvas
        role='button'
        tabIndex={0}
        className='audio-player__canvas absolute left-0 top-0 w-full'
        width={width}
        height={height}
        ref={canvas}
        onClick={togglePlay}
        onKeyDown={handleAudioKeyDown}
        title={alt}
        aria-label={alt}
      />

      {poster && (
        <img
          src={poster}
          alt=''
          className='pointer-events-none absolute aspect-1 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover'
          width={(_getRadius() - TICK_SIZE) * 2}
          height={(_getRadius() - TICK_SIZE) * 2}
          style={{
            left: _getCX(),
            top: _getCY(),
          }}
        />
      )}

      <div className='video-player__seek' onMouseDown={handleMouseDown} ref={seek}>

        <div className='video-player__seek__buffer' style={{ width: `${buffer}%` }} />

        <div
          className='video-player__seek__progress'
          style={{ width: `${progress}%`, backgroundColor: accentColor }}
        />

        <span
          className={clsx('video-player__seek__handle', { active: dragging })}
          tabIndex={0}
          style={{ left: `${progress}%`, backgroundColor: accentColor }}
          onKeyDown={handleAudioKeyDown}
        />
      </div>

      <div className='video-player__controls active'>
        <div className='video-player__buttons-bar'>
          <div className='video-player__buttons left'>

            <button
              type='button'
              title={intl.formatMessage(paused ? messages.play : messages.pause)}
              aria-label={intl.formatMessage(paused ? messages.play : messages.pause)}
              className='player-button'
              onClick={togglePlay}
            >
              <Icon src={paused ? require('@tabler/icons/player-play.svg') : require('@tabler/icons/player-pause.svg')} />
            </button>

            <button
              type='button'
              title={intl.formatMessage(muted ? messages.unmute : messages.mute)}
              aria-label={intl.formatMessage(muted ? messages.unmute : messages.mute)}
              className='player-button'
              onClick={toggleMute}
            >
              <Icon src={muted ? require('@tabler/icons/volume-3.svg') : require('@tabler/icons/volume.svg')} />
            </button>

            <div
              className={clsx('video-player__volume', { active: hovered })}
              ref={slider}
              onMouseDown={handleVolumeMouseDown}
            >
              <div
                className='video-player__volume__current'
                style={{
                  width: `${volume * 100}%`,
                  backgroundColor: _getAccentColor(),
                }}
              />

              <span
                className='video-player__volume__handle'
                tabIndex={0}
                style={{ left: `${volume * 100}%`, backgroundColor: _getAccentColor() }}
              />
            </div>

            <span className='video-player__time'>
              <span className='video-player__time-current'>{formatTime(Math.floor(currentTime))}</span>
              {getDuration() && (<>
                <span className='video-player__time-sep'>/</span>
                <span className='video-player__time-total'>{formatTime(Math.floor(getDuration()))}</span>
              </>)}
            </span>
          </div>

          <div className='video-player__buttons right'>
            <a
              title={intl.formatMessage(messages.download)}
              aria-label={intl.formatMessage(messages.download)}
              className='video-player__download__icon player-button'
              href={src}
              download
              target='_blank'
            >
              <Icon src={require('@tabler/icons/download.svg')} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audio;
