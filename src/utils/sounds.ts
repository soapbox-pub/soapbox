/** Soapbox audio clip. */
type Sound = {
  src: string;
  type: string;
}

export type Sounds = 'boop' | 'chat'

/** Produce HTML5 audio from sound data. */
const createAudio = (sources: Sound[]): HTMLAudioElement => {
  const audio = new Audio();
  sources.forEach(({ type, src }) => {
    const source = document.createElement('source');
    source.type = type;
    source.src = src;
    audio.appendChild(source);
  });
  return audio;
};

/** Play HTML5 sound. */
const play = (audio: HTMLAudioElement): Promise<void> => {
  if (!audio.paused) {
    audio.pause();
    if (typeof audio.fastSeek === 'function') {
      audio.fastSeek(0);
    } else {
      audio.currentTime = 0;
    }
  }

  return audio.play().catch((error: Error) => {
    if (error.name === 'NotAllowedError') {
      // User has disabled autoplay.
      // https://developer.mozilla.org/en-US/docs/Web/Media/Autoplay_guide
      return;
    } else {
      throw error;
    }
  });
};

const soundCache: Record<Sounds, HTMLAudioElement> = {
  boop: createAudio([
    {
      src: require('../assets/sounds/boop.ogg'),
      type: 'audio/ogg',
    },
    {
      src: require('../assets/sounds/boop.mp3'),
      type: 'audio/mpeg',
    },
  ]),
  chat: createAudio([
    {
      src: require('../assets/sounds/chat.oga'),
      type: 'audio/ogg',
    },
    {
      src: require('../assets/sounds/chat.mp3'),
      type: 'audio/mpeg',
    },
  ]),
};

export { soundCache, play };
