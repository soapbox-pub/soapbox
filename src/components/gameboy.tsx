// @ts-ignore No types available
import { WasmBoy } from '@soapbox.pub/wasmboy';
import clsx from 'clsx';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { exitFullscreen, isFullscreen, requestFullscreen } from 'soapbox/features/ui/util/fullscreen';

import { IconButton } from './ui';

let gainNode: GainNode | undefined;

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
  const [showControls, setShowControls] = useState(true);

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

  const handleCanvasClick = useCallback(() => {
    setShowControls(!showControls);
  }, [showControls]);

  const pause = async () => {
    await WasmBoy.pause();
    setPaused(true);
  };

  const play = async () => {
    await WasmBoy.play();
    setPaused(false);
  };

  const togglePaused = () => paused ? play() : pause();
  const toggleMuted = () => setMuted(!muted);

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

  useEffect(() => {
    if (fullscreen) {
      node.current?.focus();
    }
  }, [fullscreen]);

  useEffect(() => {
    if (gainNode) {
      gainNode.gain.value = muted ? 0 : 1;
    }
  }, [gainNode, muted]);

  return (
    <div
      ref={node}
      tabIndex={0}
      className={clsx(className, 'relative outline-none')}
      onFocus={onFocus ?? handleFocus}
      onBlur={onBlur ?? handleBlur}
    >
      <canvas
        ref={canvas}
        onClick={handleCanvasClick}
        className={clsx('h-full w-full bg-black ', {
          'object-contain': aspect === 'normal',
          'object-cover': aspect === 'stretched',
        })}
        {...rest}
      />

      <div
        className={clsx('absolute inset-x-0 bottom-0 flex w-full bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 transition-opacity', {
          'opacity-100': showControls,
        })}
      >
        <IconButton
          className='text-white'
          onClick={togglePaused}
          src={paused ? require('@tabler/icons/player-play.svg') : require('@tabler/icons/player-pause.svg')}
        />
        <IconButton
          className='text-white'
          onClick={toggleMuted}
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
  updateAudioCallback: (audioContext: AudioContext, audioBufferSourceNode: AudioBufferSourceNode) => {
    gainNode = gainNode ?? audioContext.createGain();
    audioBufferSourceNode.connect(gainNode);
    return gainNode;
  },
  saveStateCallback: false,
};

export default Gameboy;