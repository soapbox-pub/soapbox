import { play, soundCache } from '@/utils/sounds.ts';

import type { AnyAction, Middleware } from 'redux';
import type { Sounds } from '@/utils/sounds.ts';

interface Action extends AnyAction {
  meta: {
    sound: Sounds;
  };
}

/** Middleware to play sounds in response to certain Redux actions. */
export default function soundsMiddleware(): Middleware {
  return () => next => anyAction => {
    const action = anyAction as Action;
    if (action.meta?.sound && soundCache[action.meta.sound]) {
      play(soundCache[action.meta.sound]);
    }

    return next(action);
  };
}
