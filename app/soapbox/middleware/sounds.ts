'use strict';

import { AnyAction } from 'redux';

import { play, soundCache } from 'soapbox/utils/sounds';

import type { ThunkMiddleware } from 'redux-thunk';
import type { Sounds } from 'soapbox/utils/sounds';

interface Action extends AnyAction {
  meta: {
    sound: Sounds
  }
}

/** Middleware to play sounds in response to certain Redux actions. */
export default function soundsMiddleware(): ThunkMiddleware {
  return () => next => (action: Action) => {
    if (action.meta?.sound && soundCache[action.meta.sound]) {
      play(soundCache[action.meta.sound]);
    }

    return next(action);
  };
}
