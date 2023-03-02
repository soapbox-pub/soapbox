import clsx from 'clsx';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import React, { useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
// @ts-ignore
import Overlay from 'react-overlays/lib/Overlay';
import { createSelector } from 'reselect';

import { useEmoji } from 'soapbox/actions/emojis';
import { getSettings, changeSetting } from 'soapbox/actions/settings';
import { IconButton } from 'soapbox/components/ui';
import { EmojiPicker as EmojiPickerAsync } from 'soapbox/features/ui/util/async-components';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

import EmojiPickerMenu from './emoji-picker-menu';

import type { Emoji as EmojiType } from 'soapbox/components/autosuggest-emoji';
import type { RootState } from 'soapbox/store';

let EmojiPicker: any, Emoji: any; // load asynchronously

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

const getFrequentlyUsedEmojis = createSelector([
  (state: RootState) => state.settings.get('frequentlyUsedEmojis', ImmutableMap()),
], emojiCounters => {
  let emojis = emojiCounters
    .keySeq()
    .sort((a: number, b: number) => emojiCounters.get(a) - emojiCounters.get(b))
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
  (state: RootState) => state.custom_emojis as ImmutableList<ImmutableMap<string, string>>,
], emojis => emojis.filter((e) => e.get('visible_in_picker')).sort((a, b) => {
  const aShort = a.get('shortcode')!.toLowerCase();
  const bShort = b.get('shortcode')!.toLowerCase();

  if (aShort < bShort) {
    return -1;
  } else if (aShort > bShort) {
    return 1;
  } else {
    return 0;
  }
}) as ImmutableList<ImmutableMap<string, string>>);

const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
  emoji_search: { id: 'emoji_button.search', defaultMessage: 'Search…' },
  emoji_not_found: { id: 'emoji_button.not_found', defaultMessage: 'No emoji\'s found.' },
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
});

interface IEmojiPickerDropdown {
  onPickEmoji: (data: EmojiType) => void
  button?: JSX.Element
}

const EmojiPickerDropdown: React.FC<IEmojiPickerDropdown> = ({ onPickEmoji, button }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const customEmojis = useAppSelector((state) => getCustomEmojis(state));
  const skinTone = useAppSelector((state) => getSettings(state).get('skinTone') as number);
  const frequentlyUsedEmojis = useAppSelector((state) => getFrequentlyUsedEmojis(state));

  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>();

  const target = useRef(null);

  const onSkinTone = (skinTone: number) => {
    dispatch(changeSetting(['skinTone'], skinTone));
  };

  const handlePickEmoji = (emoji: EmojiType) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    dispatch(useEmoji(emoji));

    if (onPickEmoji) {
      onPickEmoji(emoji);
    }
  };

  const onShowDropdown: React.EventHandler<React.KeyboardEvent | React.MouseEvent> = (e) => {
    e.stopPropagation();

    setActive(true);

    if (!EmojiPicker) {
      setLoading(true);

      EmojiPickerAsync().then(EmojiMart => {
        EmojiPicker = EmojiMart.Picker;
        Emoji = EmojiMart.Emoji;

        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    }

    const { top } = (e.target as any).getBoundingClientRect();
    setPlacement(top * 2 < innerHeight ? 'bottom' : 'top');
  };

  const onHideDropdown = () => {
    setActive(false);
  };

  const onToggle: React.EventHandler<React.KeyboardEvent | React.MouseEvent> = (e) => {
    if (!loading && (!(e as React.KeyboardEvent).key || (e as React.KeyboardEvent).key === 'Enter')) {
      if (active) {
        onHideDropdown();
      } else {
        onShowDropdown(e);
      }
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = e => {
    if (e.key === 'Escape') {
      onHideDropdown();
    }
  };

  const title = intl.formatMessage(messages.emoji);

  return (
    <div className='relative' onKeyDown={handleKeyDown}>
      <div
        ref={target}
        title={title}
        aria-label={title}
        aria-expanded={active}
        role='button'
        onClick={onToggle}
        onKeyDown={onToggle}
        tabIndex={0}
      >
        {button || <IconButton
          className={clsx({
            'text-gray-600 hover:text-gray-700 dark:hover:text-gray-500': true,
            'pulse-loading': active && loading,
          })}
          title='😀'
          src={require('@tabler/icons/mood-happy.svg')}
        />}
      </div>

      <Overlay show={active} placement={placement} target={target.current}>
        <EmojiPickerMenu
          customEmojis={customEmojis}
          loading={loading}
          onClose={onHideDropdown}
          onPick={handlePickEmoji}
          onSkinTone={onSkinTone}
          skinTone={skinTone}
          frequentlyUsedEmojis={frequentlyUsedEmojis}
        />
      </Overlay>
    </div>
  );
};

export { EmojiPicker, Emoji };

export default EmojiPickerDropdown;
