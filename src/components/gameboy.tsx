import React, { useCallback, useEffect, useRef } from 'react';
// @ts-ignore No types available
import { WasmBoy } from 'wasmboy';

interface IGameboy extends React.CanvasHTMLAttributes<HTMLCanvasElement> {
  /** URL to the ROM. */
  src: string;
}

/** Component to display a playable Gameboy emulator. */
const Gameboy: React.FC<IGameboy> = ({ src, onFocus, onBlur, ...rest }) => {
  const canvas = useRef<HTMLCanvasElement>(null);

  async function init() {
    await WasmBoy.config(WasmBoyOptions, canvas.current!);
    await WasmBoy.loadROM(src);
    await WasmBoy.play();

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

  useEffect(() => {
    init();

    return () => {
      WasmBoy.pause();
      WasmBoy.disableDefaultJoypad();
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      tabIndex={0}
      onFocus={onFocus ?? handleFocus}
      onBlur={onBlur ?? handleBlur}
      {...rest}
    />
  );
};

const WasmBoyOptions = {
  headless: false,
  useGbcWhenOptional: true,
  isAudioEnabled: false,
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

export { Gameboy };