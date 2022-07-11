import classNames from 'classnames';
import { supportsPassiveEvents } from 'detect-passive-events';
import React, { useEffect, useState, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { defineMessages, useIntl } from 'react-intl';
import { usePopper } from 'react-popper';

import { useSettings } from 'soapbox/hooks';
import { isMobile } from 'soapbox/is_mobile';

import { buildCustomEmojis } from '../../emoji';
import { EmojiPicker as EmojiPickerAsync } from '../../ui/util/async-components';
// import { Picker as EmojiPicker } from '../../emoji/emoji_picker';

import type { EmojiPick } from 'emoji-mart';
import type { List } from 'immutable';
import type { Emoji, CustomEmoji, NativeEmoji } from 'soapbox/features/emoji';

let EmojiPicker: any; // load asynchronously

// const categories = [
//   'frequent',
//   'custom',
//   'people',
//   'nature',
//   'foods',
//   'activity',
//   'places',
//   'objects',
//   'symbols',
//   'flags',
// ];

const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
  emoji_pick: { id: 'emoji_button.pick', defaultMessage: 'Pick an emoji...' },
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

// TODO: fix types
interface IEmojiPickerDropdown {
  custom_emojis: List<any>,
  frequentlyUsedEmojis: string[],
  intl: any,
  onPickEmoji: (emoji: Emoji) => void,
  onSkinTone: () => void,
  condensed: boolean,
  render: any,
}

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

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

const EmojiPickerDropdown: React.FC<IEmojiPickerDropdown> = ({ custom_emojis, frequentlyUsedEmojis, onPickEmoji, onSkinTone, condensed, render: Render }) => {
  const intl = useIntl();
  const settings = useSettings();
  const title = intl.formatMessage(messages.emoji);
  const userTheme = settings.get('themeMode');
  const theme = (userTheme === 'dark' || userTheme === 'light') ? userTheme : 'auto';

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [popperReference, setPopperReference] = useState<HTMLButtonElement | null>(null);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);

  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const placement = condensed ? 'bottom-start' : 'top-start';
  const { styles, attributes, update } = usePopper(popperReference, popperElement, {
    placement: isMobile(window.innerWidth) ? 'auto' : placement,
  });

  const handleToggle = (e: Event) => {
    e.stopPropagation();
    setVisible(!visible);
  };

  const handleDocClick = (e: any) => {
    if (!containerElement?.contains(e.target) && !popperElement?.contains(e.target)) {
      setVisible(false);
    }
  };

  const handlePick = (emoji: EmojiPick) => {
    setVisible(false);

    if (emoji.native) {
      onPickEmoji({
        id: emoji.id,
        colons: emoji.shortcodes,
        custom: false,
        native: emoji.native,
        unified: emoji.unified,
      } as NativeEmoji);
    } else {
      onPickEmoji({
        id: emoji.id,
        colons: emoji.shortcodes,
        custom: true,
        imageUrl: emoji.src,
      } as CustomEmoji);
    }
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
    document.addEventListener('click', handleDocClick, false);
    document.addEventListener('touchend', handleDocClick, listenerOptions);

    return function cleanup() {
      document.removeEventListener('click', handleDocClick, false);
      // @ts-ignore
      document.removeEventListener('touchend', handleDocClick, listenerOptions);
    };
  });

  useEffect(() => {
    // fix scrolling focus issue
    if (visible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'initial';
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

  // TODO: move to class
  const style: React.CSSProperties = !isMobile(window.innerWidth) ? styles.popper : {
    ...styles.popper, width: '100%',
  };

  return (
    <div className='relative' ref={setContainerElement}>
      <Render
        handleToggle={handleToggle}
        visible={visible}
        loading={loading}
        title={title}
        setPopperReference={setPopperReference}
      />

      {createPortal(
        <div
          className={classNames({ 'z-1000': true })}
          ref={setPopperElement}
          style={style}
          {...attributes.popper}
        >
          {visible && (
            <RenderAfter update={update}>
              {!loading && (
                <EmojiPicker
                  custom={[{ emojis: buildCustomEmojis(custom_emojis) }]}
                  title={title}
                  onEmojiSelect={handlePick}
                  recent={frequentlyUsedEmojis}
                  perLine={8}
                  skin={onSkinTone}
                  emojiSize={38}
                  emojiButtonSize={50}
                  set={'twitter'}
                  theme={theme}
                  i18n={getI18n()}
                  // categories={categories}
                />
              )}
            </RenderAfter>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
};

export default EmojiPickerDropdown;
