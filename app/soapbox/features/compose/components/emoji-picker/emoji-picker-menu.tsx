import classNames from 'clsx';
import { supportsPassiveEvents } from 'detect-passive-events';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { buildCustomEmojis, categoriesFromEmojis } from '../../../emoji/emoji';

import { EmojiPicker } from './emoji-picker-dropdown';
import ModifierPicker from './modifier-picker';

import type { Emoji } from 'soapbox/components/autosuggest-emoji';

const backgroundImageFn = () => require('emoji-datasource/img/twitter/sheets/32.png');
const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

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

interface IEmojiPickerMenu {
  customEmojis: ImmutableList<ImmutableMap<string, string>>,
  loading?: boolean,
  onClose: () => void,
  onPick: (emoji: Emoji) => void,
  onSkinTone: (skinTone: number) => void,
  skinTone?: number,
  frequentlyUsedEmojis?: Array<string>,
  style?: React.CSSProperties,
}

const EmojiPickerMenu: React.FC<IEmojiPickerMenu> = ({
  customEmojis,
  loading = true,
  onClose,
  onPick,
  onSkinTone,
  skinTone,
  frequentlyUsedEmojis = [],
  style = {},
}) => {
  const intl = useIntl();

  const node = useRef<HTMLDivElement>(null);

  const [modifierOpen, setModifierOpen] = useState(false);

  const categoriesSort = [
    'recent',
    'people',
    'nature',
    'foods',
    'activity',
    'places',
    'objects',
    'symbols',
    'flags',
  ];

  categoriesSort.splice(1, 0, ...Array.from(categoriesFromEmojis(customEmojis) as Set<string>).sort());

  const handleDocumentClick = useCallback(e => {
    if (node.current && !node.current.contains(e.target)) {
      onClose();
    }
  }, []);

  const getI18n = () => {
    return {
      search: intl.formatMessage(messages.emoji_search),
      notfound: intl.formatMessage(messages.emoji_not_found),
      categories: {
        search: intl.formatMessage(messages.search_results),
        recent: intl.formatMessage(messages.recent),
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
    };
  };

  const handleClick = (emoji: any) => {
    if (!emoji.native) {
      emoji.native = emoji.colons;
    }

    onClose();
    onPick(emoji);
  };

  const handleModifierOpen = () => {
    setModifierOpen(true);
  };

  const handleModifierClose = () => {
    setModifierOpen(false);
  };

  const handleModifierChange = (modifier: number) => {
    onSkinTone(modifier);
  };

  useEffect(() => {
    document.addEventListener('click', handleDocumentClick, false);
    document.addEventListener('touchend', handleDocumentClick, listenerOptions);

    return () => {
      document.removeEventListener('click', handleDocumentClick, false);
      document.removeEventListener('touchend', handleDocumentClick, listenerOptions as any);
    };
  }, []);

  if (loading) {
    return <div style={{ width: 299 }} />;
  }

  const title = intl.formatMessage(messages.emoji);

  return (
    <div className={classNames('emoji-picker-dropdown__menu', { selecting: modifierOpen })} style={style} ref={node}>
      <EmojiPicker
        perLine={8}
        emojiSize={22}
        sheetSize={32}
        custom={buildCustomEmojis(customEmojis)}
        color=''
        emoji=''
        set='twitter'
        title={title}
        i18n={getI18n()}
        onClick={handleClick}
        include={categoriesSort}
        recent={frequentlyUsedEmojis}
        skin={skinTone}
        showPreview={false}
        backgroundImageFn={backgroundImageFn}
        autoFocus
        emojiTooltip
      />

      <ModifierPicker
        active={modifierOpen}
        modifier={skinTone}
        onOpen={handleModifierOpen}
        onClose={handleModifierClose}
        onChange={handleModifierChange}
      />
    </div>
  );
};

export default EmojiPickerMenu;
