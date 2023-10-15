import boopMp3 from 'soapbox/assets/sounds/boop.mp3';
import boopOgg from 'soapbox/assets/sounds/boop.ogg';
import chatMp3 from 'soapbox/assets/sounds/chat.mp3';
import chatOgg from 'soapbox/assets/sounds/chat.ogg';

/** Soapbox audio clip. */
interface Sound {
  src: string;
  type: string;
}

type Sounds = 'boop' | 'chat';

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
    { src: boopOgg, type: 'audio/ogg' },
    { src: boopMp3, type: 'audio/mpeg' },
  ]),
  chat: createAudio([
    { src: chatOgg, type: 'audio/ogg' },
    { src: chatMp3, type: 'audio/mpeg' },
  ]),
};

export { soundCache, play, type Sounds };
