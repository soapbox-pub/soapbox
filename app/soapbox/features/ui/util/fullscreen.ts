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

type FullscreenListener = (this: Document, ev: Event) => void;

export const attachFullscreenListener = (listener: FullscreenListener): void => {
  if ('onfullscreenchange' in document) {
    document.addEventListener('fullscreenchange', listener);
  } else if ('onwebkitfullscreenchange' in document) {
    document.addEventListener('webkitfullscreenchange', listener);
  } else if ('onmozfullscreenchange' in document) {
    document.addEventListener('mozfullscreenchange', listener);
  }
};

export const detachFullscreenListener = (listener: FullscreenListener): void => {
  if ('onfullscreenchange' in document) {
    document.removeEventListener('fullscreenchange', listener);
  } else if ('onwebkitfullscreenchange' in document) {
    document.removeEventListener('webkitfullscreenchange', listener);
  } else if ('onmozfullscreenchange' in document) {
    document.removeEventListener('mozfullscreenchange', listener);
  }
};
