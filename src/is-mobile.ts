/** Breakpoint at which the application is considered "mobile". */
const LAYOUT_BREAKPOINT = 630;

/** Check if the width is small enough to be considered "mobile". */
export function isMobile(width: number) {
  return width <= LAYOUT_BREAKPOINT;
}

/** Whether the device is iOS (best guess). */
const iOS: boolean = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

export const userTouching = window.matchMedia('(pointer: coarse)');

/** Whether the device is iOS (best guess). */
export function isIOS(): boolean {
  return iOS;
}
