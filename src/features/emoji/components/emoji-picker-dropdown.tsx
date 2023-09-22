import { Map as ImmutableMap } from 'immutable';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { createSelector } from 'reselect';

import { useEmoji } from 'soapbox/actions/emojis';
import { changeSetting } from 'soapbox/actions/settings';
import { useAppDispatch, useAppSelector, useSettings } from 'soapbox/hooks';
import { RootState } from 'soapbox/store';

import { buildCustomEmojis } from '../../emoji';
import { EmojiPicker as EmojiPickerAsync } from '../../ui/util/async-components';

import type { Emoji, CustomEmoji, NativeEmoji } from 'soapbox/features/emoji';

let EmojiPicker: any; // load asynchronously

export const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
  emoji_pick: { id: 'emoji_button.pick', defaultMessage: 'Pick an emoji…' },
  emoji_oh_no: { id: 'emoji_button.oh_no', defaultMessage: 'Oh no!' },
  emoji_search: { id: 'emoji_button.search', defaultMessage: 'Search…' },
  emoji_not_found: { id: 'emoji_button.not_found', defaultMessage: 'No emoji\'s found.' },
  emoji_add_custom: { id: 'emoji_button.add_custom', defaultMessage: 'Add custom emoji' },
  custom: { id: 'emoji_button.custom', defaultMessage: 'Custom' },
  recent: { id: 'emoji_button.recent', defaultMessage: 'Frequently used' },
  search_results: { id: 'emoji_button.search_results', defaultMessage: 'Search results' },
  people: { id: 'emoji_button.people', defaultMessage: 'People' },
  nature: { id: 'emoji_button.nature', defaultMessage: 'Nature' },
  food: { id: 'emoji_button.food', defaultMessage: 'Food & Drink' },
  activity: { id: 'emoji_button.activity', defaultMessage: 'Activity' },
  travel: { id: 'emoji_button.travel', defaultMessage: 'Travel & Places' },
  objects: { id: 'emoji_button.objects', defaultMessage: 'Objects' },
  symbols: { id: 'emoji_button.symbols', defaultMessage: 'Symbols' },
  flags: { id: 'emoji_button.flags', defaultMessage: 'Flags' },
  skins_choose: { id: 'emoji_button.skins_choose', defaultMessage: 'Choose default skin tone' },
  skins_1: { id: 'emoji_button.skins_1', defaultMessage: 'Default' },
  skins_2: { id: 'emoji_button.skins_2', defaultMessage: 'Light' },
  skins_3: { id: 'emoji_button.skins_3', defaultMessage: 'Medium-Light' },
  skins_4: { id: 'emoji_button.skins_4', defaultMessage: 'Medium' },
  skins_5: { id: 'emoji_button.skins_5', defaultMessage: 'Medium-Dark' },
  skins_6: { id: 'emoji_button.skins_6', defaultMessage: 'Dark' },
});

export interface IEmojiPickerDropdown {
  onPickEmoji?: (emoji: Emoji) => void
  condensed?: boolean
  withCustom?: boolean
  visible: boolean
  setVisible: (value: boolean) => void
  update: (() => any) | null
}

const perLine = 8;
const lines   = 2;

const DEFAULTS = [
  '+1',
  'grinning',
  'kissing_heart',
  'heart_eyes',
  'laughing',
  'stuck_out_tongue_winking_eye',
  'sweat_smile',
  'joy',
  'yum',
  'disappointed',
  'thinking_face',
  'weary',
  'sob',
  'sunglasses',
  'heart',
  'ok_hand',
];

export const getFrequentlyUsedEmojis = createSelector([
  (state: RootState) => state.settings.get('frequentlyUsedEmojis', ImmutableMap()),
], (emojiCounters: ImmutableMap<string, number>) => {
  let emojis = emojiCounters
    .keySeq()
    .sort((a, b) => emojiCounters.get(a)! - emojiCounters.get(b)!)
    .reverse()
    .slice(0, perLine * lines)
    .toArray();

  if (emojis.length < DEFAULTS.length) {
    const uniqueDefaults = DEFAULTS.filter(emoji => !emojis.includes(emoji));
    emojis = emojis.concat(uniqueDefaults.slice(0, DEFAULTS.length - emojis.length));
  }

  return emojis;
});

const getCustomEmojis = createSelector([
  (state: RootState) => state.custom_emojis,
], emojis => emojis.filter(e => e.get('visible_in_picker')).sort((a, b) => {
  const aShort = a.get('shortcode')!.toLowerCase();
  const bShort = b.get('shortcode')!.toLowerCase();

  if (aShort < bShort) {
    return -1;
  } else if (aShort > bShort) {
    return 1;
  } else {
    return 0;
  }
}));

// Fixes render bug where popover has a delayed position update
const RenderAfter = ({ children, update }: any) => {
  const [nextTick, setNextTick] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setNextTick(true);
    }, 0);
  }, []);

  useLayoutEffect(() => {
    if (nextTick) {
      update();
    }
  }, [nextTick, update]);

  return nextTick ? children : null;
};

const EmojiPickerDropdown: React.FC<IEmojiPickerDropdown> = ({
  onPickEmoji, visible, setVisible, update, withCustom = true,
}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const settings = useSettings();
  const title = intl.formatMessage(messages.emoji);
  const userTheme = settings.get('themeMode');
  const theme = (userTheme === 'dark' || userTheme === 'light') ? userTheme : 'auto';

  const customEmojis = useAppSelector((state) => getCustomEmojis(state));
  const frequentlyUsedEmojis = useAppSelector((state) => getFrequentlyUsedEmojis(state));

  const [loading, setLoading] = useState(false);

  const handlePick = (emoji: any) => {
    setVisible(false);

    let pickedEmoji: Emoji;

    if (emoji.native) {
      pickedEmoji = {
        id: emoji.id,
        colons: emoji.shortcodes,
        custom: false,
        native: emoji.native,
        unified: emoji.unified,
      } as NativeEmoji;
    } else {
      pickedEmoji = {
        id: emoji.id,
        colons: emoji.shortcodes,
        custom: true,
        imageUrl: emoji.src,
      } as CustomEmoji;
    }

    dispatch(useEmoji(pickedEmoji)); // eslint-disable-line react-hooks/rules-of-hooks

    if (onPickEmoji) {
      onPickEmoji(pickedEmoji);
    }
  };

  const handleSkinTone = (skinTone: string) => {
    dispatch(changeSetting(['skinTone'], skinTone));
  };

  const getI18n = () => {
    return {
      search: intl.formatMessage(messages.emoji_search),
      pick: intl.formatMessage(messages.emoji_pick),
      search_no_results_1: intl.formatMessage(messages.emoji_oh_no),
      search_no_results_2: intl.formatMessage(messages.emoji_not_found),
      add_custom: intl.formatMessage(messages.emoji_add_custom),
      categories: {
        search: intl.formatMessage(messages.search_results),
        frequent: intl.formatMessage(messages.recent),
        people: intl.formatMessage(messages.people),
        nature: intl.formatMessage(messages.nature),
        foods: intl.formatMessage(messages.food),
        activity: intl.formatMessage(messages.activity),
        places: intl.formatMessage(messages.travel),
        objects: intl.formatMessage(messages.objects),
        symbols: intl.formatMessage(messages.symbols),
        flags: intl.formatMessage(messages.flags),
        custom: intl.formatMessage(messages.custom),
      },
      skins: {
        choose: intl.formatMessage(messages.skins_choose),
        1: intl.formatMessage(messages.skins_1),
        2: intl.formatMessage(messages.skins_2),
        3: intl.formatMessage(messages.skins_3),
        4: intl.formatMessage(messages.skins_4),
        5: intl.formatMessage(messages.skins_5),
        6: intl.formatMessage(messages.skins_6),
      },
    };
  };

  useEffect(() => {
    // fix scrolling focus issue
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    if (!EmojiPicker) {
      setLoading(true);

      EmojiPickerAsync().then(EmojiMart => {
        EmojiPicker = EmojiMart.Picker;

        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }
  }, [visible]);

  useEffect(() => () => {
    document.body.style.overflow = '';
  }, []);

  return (
    visible ? (
      <RenderAfter update={update}>
        {!loading && (
          <EmojiPicker
            custom={withCustom ? [{ emojis: buildCustomEmojis(customEmojis) }] : undefined}
            title={title}
            onEmojiSelect={handlePick}
            recent={frequentlyUsedEmojis}
            perLine={8}
            skin={handleSkinTone}
            emojiSize={22}
            emojiButtonSize={34}
            set='twitter'
            theme={theme}
            i18n={getI18n()}
            skinTonePosition='search'
            previewPosition='none'
          />
        )}
      </RenderAfter>
    ) : null
  );
};

export default EmojiPickerDropdown;
