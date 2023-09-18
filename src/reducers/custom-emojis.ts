import { List as ImmutableList, Map as ImmutableMap, fromJS } from 'immutable';

import { buildCustomEmojis } from 'soapbox/features/emoji';
import emojiData from 'soapbox/features/emoji/data';
import { addCustomToPool } from 'soapbox/features/emoji/search';

import { CUSTOM_EMOJIS_FETCH_SUCCESS } from '../actions/custom-emojis';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities';

const initialState = ImmutableList<ImmutableMap<string, string>>();

// Populate custom emojis for composer autosuggest
const autosuggestPopulate = (emojis: ImmutableList<ImmutableMap<string, string>>) => {
  addCustomToPool(buildCustomEmojis(emojis));
};

const importEmojis = (customEmojis: APIEntity[]) => {
  const emojis = (fromJS(customEmojis) as ImmutableList<ImmutableMap<string, string>>).filter((emoji) => {
    // If a custom emoji has the shortcode of a Unicode emoji, skip it.
    // Otherwise it breaks EmojiMart.
    // https://gitlab.com/soapbox-pub/soapbox/-/issues/610
    const shortcode = emoji.get('shortcode', '').toLowerCase();
    return !emojiData.emojis[shortcode];
  });

  autosuggestPopulate(emojis);
  return emojis;
};

export default function custom_emojis(state = initialState, action: AnyAction) {
  if (action.type === CUSTOM_EMOJIS_FETCH_SUCCESS) {
    return importEmojis(action.custom_emojis);
  }

  return state;
}
