import { saveSettings } from './settings.ts';

import type { Emoji } from 'soapbox/features/emoji/index.ts';
import type { AppDispatch } from 'soapbox/store.ts';

const EMOJI_CHOOSE = 'EMOJI_CHOOSE';

const chooseEmoji = (emoji: Emoji) =>
  (dispatch: AppDispatch) => {
    dispatch({
      type: EMOJI_CHOOSE,
      emoji,
    });

    dispatch(saveSettings());
  };

export {
  EMOJI_CHOOSE,
  chooseEmoji,
};
