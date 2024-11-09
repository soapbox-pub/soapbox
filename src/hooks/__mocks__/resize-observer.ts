import { vi } from 'vitest';

let listener: ((rect: any) => void) | undefined = undefined;
const mockDisconnect = vi.fn();

class ResizeObserver {

  constructor(ls: any) {
    listener = ls;
  }

  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    mockDisconnect();
  }

}

// eslint-disable-next-line compat/compat
(window as any).ResizeObserver = ResizeObserver;

export { ResizeObserver as default, listener, mockDisconnect };