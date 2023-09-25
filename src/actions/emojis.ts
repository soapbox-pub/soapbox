import { saveSettings } from './settings';

import type { Emoji } from 'soapbox/features/emoji';
import type { AppDispatch } from 'soapbox/store';

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
