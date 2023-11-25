// @ts-ignore No types available
import { WasmBoy } from '@soapbox.pub/wasmboy';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { IconButton } from './ui';

interface IGameboy extends Pick<React.CanvasHTMLAttributes<HTMLCanvasElement>, 'onFocus' | 'onBlur'> {
  /** Classname of the outer `<div>`. */
  className?: string;
  /** URL to the ROM. */
  src: string;
  /** Aspect ratio of the canvas. */
  aspect?: 'normal' | 'stretched';
}

/** Component to display a playable Gameboy emulator. */
const Gameboy: React.FC<IGameboy> = ({ className, src, aspect = 'normal', onFocus, onBlur, ...rest }) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

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

  const handleFocus: React.FocusEventHandler<HTMLCanvasElement> = useCallback(() => {
    WasmBoy.enableDefaultJoypad();
  }, []);

  const handleBlur: React.FocusEventHandler<HTMLCanvasElement> = useCallback(() => {
    WasmBoy.disableDefaultJoypad();
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

  useEffect(() => {
    init();

    return () => {
      WasmBoy.pause();
      WasmBoy.disableDefaultJoypad();
    };
  }, []);

  return (
    <div className={clsx(className, 'relative')}>
      <canvas
        ref={canvas}
        tabIndex={0}
        className={clsx('h-full w-full bg-black ', {
          'object-contain': aspect === 'normal',
          'object-cover': aspect === 'stretched',
        })}
        onFocus={onFocus ?? handleFocus}
        onBlur={onBlur ?? handleBlur}
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