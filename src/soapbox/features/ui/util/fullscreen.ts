// APIs for normalizing fullscreen operations. Note that Edge uses
// the WebKit-prefixed APIs currently (as of Edge 16).

export const isFullscreen = (): boolean => {
  return Boolean(
    document.fullscreenElement ||
    // @ts-ignore
    document.webkitFullscreenElement ||
    // @ts-ignore
    document.mozFullScreenElement,
  );
};

export const exitFullscreen = (): void => {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if ('webkitExitFullscreen' in document) {
    // @ts-ignore
    document.webkitExitFullscreen();
  } else if ('mozCancelFullScreen' in document) {
    // @ts-ignore
    document.mozCancelFullScreen();
  }
};

export const requestFullscreen = (el: Element): void => {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if ('webkitRequestFullscreen' in el) {
    // @ts-ignore
    el.webkitRequestFullscreen();
  } else if ('mozRequestFullScreen' in el) {
    // @ts-ignore
    el.mozRequestFullScreen();
  }
};