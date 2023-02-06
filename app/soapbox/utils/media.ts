const truncateFilename = (url: string, maxLength: number) => {
  const filename = url.split('/').pop();

  if (!filename) {
    return filename;
  }

  if (filename.length <= maxLength) return filename;

  return [
    filename.substr(0, maxLength / 2),
    filename.substr(filename.length - maxLength / 2),
  ].join('…');
};

const formatBytes = (bytes: number, decimals: number = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getVideoDuration = (file: File): Promise<number> => {
  const video = document.createElement('video');

  const promise = new Promise<number>((resolve, reject) => {
    video.addEventListener('loadedmetadata', () => {
      // Chrome bug: https://bugs.chromium.org/p/chromium/issues/detail?id=642012
      if (video.duration === Infinity) {
        video.currentTime = Number.MAX_SAFE_INTEGER;
        video.ontimeupdate = () => {
          video.ontimeupdate = null;
          resolve(video.duration);
          video.currentTime = 0;
        };
      } else {
        resolve(video.duration);
      }
    });

    video.onerror = (event: any) => reject(event.target.error);
  });

  video.src = window.URL.createObjectURL(file);

  return promise;
};

const domParser = new DOMParser();

enum VideoProviders {
  RUMBLE = 'rumble.com'
}

/** Try adding autoplay to an iframe embed for platforms such as YouTube. */
const addAutoPlay = (html: string): string => {
  try {
    const document = domParser.parseFromString(html, 'text/html').documentElement;
    const iframe = document.querySelector('iframe');

    if (iframe) {
      const url = new URL(iframe.src);
      const provider = new URL(iframe.src).host;

      if (provider === VideoProviders.RUMBLE) {
        url.searchParams.append('pub', '7a20');
        url.searchParams.append('autoplay', '2');
      } else {
        url.searchParams.append('autoplay', '1');
        url.searchParams.append('auto_play', '1');
        iframe.allow = 'autoplay';
      }

      iframe.src = url.toString();

      // DOM parser creates html/body elements around original HTML fragment,
      // so we need to get innerHTML out of the body and not the entire document
      return (document.querySelector('body') as HTMLBodyElement).innerHTML;
    }
  } catch (e) {
    return html;
  }

  return html;
};

export { getVideoDuration, formatBytes, truncateFilename, addAutoPlay };
