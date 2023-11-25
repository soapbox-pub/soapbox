// @ts-ignore No types available
import { WasmBoy } from '@soapbox.pub/wasmboy';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { exitFullscreen, isFullscreen, requestFullscreen } from 'soapbox/features/ui/util/fullscreen';

import { IconButton } from './ui';

interface IGameboy extends Pick<React.HTMLAttributes<HTMLDivElement>, 'onFocus' | 'onBlur'> {
  /** Classname of the outer `<div>`. */
  className?: string;
  /** URL to the ROM. */
  src: string;
  /** Aspect ratio of the canvas. */
  aspect?: 'normal' | 'stretched';
}

/** Component to display a playable Gameboy emulator. */
const Gameboy: React.FC<IGameboy> = ({ className, src, aspect = 'normal', onFocus, onBlur, ...rest }) => {
  const node = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  async function init() {
    await WasmBoy.config(WasmBoyOptions, canvas.current!);
    await WasmBoy.loadROM(src);
    await play();

    if (document.activeElement === canvas.current) {
      await WasmBoy.enableDefaultJoypad();
    } else {
      await WasmBoy.disableDefaultJoypad();
    }
  }

  const handleFocus: React.FocusEventHandler<HTMLDivElement> = useCallback(() => {
    WasmBoy.enableDefaultJoypad();
  }, []);

  const handleBlur: React.FocusEventHandler<HTMLDivElement> = useCallback(() => {
    WasmBoy.disableDefaultJoypad();
  }, []);

  const handleFullscreenChange = useCallback(() => {
    setFullscreen(isFullscreen());
  }, []);

  const pause = async () => {
    await WasmBoy.pause();
    setPaused(true);
  };

  const play = async () => {
    await WasmBoy.play();
    setPaused(false);
  };

  const togglePaused = () => paused ? play() : pause();

  const unmute = async () => {
    await WasmBoy.resumeAudioContext();
    setMuted(false);
  };

  const toggleFullscreen = () => {
    if (isFullscreen()) {
      exitFullscreen();
    } else if (node.current) {
      requestFullscreen(node.current);
    }
  };

  useEffect(() => {
    init();

    return () => {
      WasmBoy.pause();
      WasmBoy.disableDefaultJoypad();
    };
  }, []);

  useEffect(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange, true);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange, true);
    };
  }, []);

  return (
    <div
      ref={node}
      tabIndex={0}
      className={clsx(className, 'relative')}
      onFocus={onFocus ?? handleFocus}
      onBlur={onBlur ?? handleBlur}
    >
      <canvas
        ref={canvas}
        className={clsx('h-full w-full bg-black ', {
          'object-contain': aspect === 'normal',
          'object-cover': aspect === 'stretched',
        })}
        {...rest}
      />

      <div className='absolute inset-x-0 bottom-0 flex w-full bg-gradient-to-t from-black/50 to-transparent p-2'>
        <IconButton
          className='text-white'
          onClick={togglePaused}
          src={paused ? require('@tabler/icons/player-play.svg') : require('@tabler/icons/player-pause.svg')}
        />
        <IconButton
          className='text-white'
          onClick={unmute}
          src={muted ? require('@tabler/icons/volume-3.svg') : require('@tabler/icons/volume.svg')}
        />
        <IconButton
          className='ml-auto text-white'
          onClick={toggleFullscreen}
          src={fullscreen ? require('@tabler/icons/arrows-minimize.svg') : require('@tabler/icons/arrows-maximize.svg')}
        />
      </div>
    </div>
  );
};

const WasmBoyOptions = {
  headless: false,
  useGbcWhenOptional: true,
  isAudioEnabled: true,
  frameSkip: 1,
  audioBatchProcessing: true,
  timersBatchProcessing: false,
  audioAccumulateSamples: true,
  graphicsBatchProcessing: false,
  graphicsDisableScanlineRendering: false,
  tileRendering: true,
  tileCaching: true,
  gameboyFPSCap: 60,
  updateGraphicsCallback: false,
  updateAudioCallback: false,
  saveStateCallback: false,
};

export default Gameboy;