import { Placement } from '@popperjs/core';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { usePopper } from 'react-popper';

import { changeSetting } from 'soapbox/actions/settings';
import { Emoji, HStack, IconButton } from 'soapbox/components/ui';
import { getFrequentlyUsedEmojis, messages } from 'soapbox/features/emoji/components/emoji-picker-dropdown';
import { EmojiPicker as EmojiPickerAsync } from 'soapbox/features/ui/util/async-components';
import { useAppDispatch, useAppSelector, useSettings, useSoapboxConfig } from 'soapbox/hooks';

let EmojiPicker: any; // load asynchronously

interface IEmojiButton {
  /** Unicode emoji character. */
  emoji: string
  /** Event handler when the emoji is clicked. */
  onClick(emoji: string): void
  /** Extra class name on the <button> element. */
  className?: string
  /** Tab order of the button. */
  tabIndex?: number
}

/** Clickable emoji button that scales when hovered. */
const EmojiButton: React.FC<IEmojiButton> = ({ emoji, className, onClick, tabIndex }): JSX.Element => {
  const handleClick: React.EventHandler<React.MouseEvent> = (event) => {
    event.preventDefault();
    event.stopPropagation();

    onClick(emoji);
  };

  return (
    <button className={clsx(className)} onClick={handleClick} tabIndex={tabIndex}>
      <Emoji className='h-6 w-6 duration-100 hover:scale-110' emoji={emoji} />
    </button>
  );
};

interface IEmojiSelector {
  onClose?(): void
  /** Event handler when an emoji is clicked. */
  onReact(emoji: string): void
  /** Element that triggers the EmojiSelector Popper */
  referenceElement: HTMLElement | null
  placement?: Placement
  /** Whether the selector should be visible. */
  visible?: boolean
  /** X/Y offset of the floating picker. */
  offset?: [number, number]
  /** Whether to allow any emoji to be chosen. */
  all?: boolean
}

/** Panel with a row of emoji buttons. */
const EmojiSelector: React.FC<IEmojiSelector> = ({
  referenceElement,
  onClose,
  onReact,
  placement = 'top',
  visible = false,
  offset = [-10, 0],
  all = true,
}): JSX.Element => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const frequentlyUsedEmojis = useAppSelector(state => getFrequentlyUsedEmojis(state));
  const settings = useSettings();
  const userTheme = settings.get('themeMode');
  const theme = (userTheme === 'dark' || userTheme === 'light') ? userTheme : 'auto';
  const soapboxConfig = useSoapboxConfig();

  const title = intl.formatMessage(messages.emoji);

  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // `useRef` won't trigger a re-render, while `useState` does.
  // https://popper.js.org/react-popper/v2/
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

  const onSkinTone = (skinTone: string) => {
    dispatch(changeSetting(['skinTone'], skinTone));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if ([referenceElement, popperElement].some(el => el?.contains(event.target as Node))) {
      return;
    }

    if (document.querySelector('em-emoji-picker')) {
      return setExpanded(false);
    }

    if (onClose) {
      onClose();
    }
  };

  const { styles, attributes, update } = usePopper(referenceElement, popperElement, {
    placement,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset,
        },
      },
    ],
  });

  const handleExpand: React.MouseEventHandler = () => {
    setExpanded(true);
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

  useEffect(() => () => {
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    setExpanded(false);
  }, [visible]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [referenceElement]);

  useEffect(() => {
    if (visible && update) {
      update();
    }
  }, [visible, update]);

  useEffect(() => {
    if (expanded && update) {
      update();
    }
  }, [expanded, update]);

  useEffect(() => {
    // fix scrolling focus issue
    if (visible && expanded) {
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
  }, [visible, expanded]);

  return (
    <div
      className={clsx('z-[101] transition-opacity duration-100', {
        'opacity-0 pointer-events-none': !visible,
      })}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
    >
      {expanded ? (
        !loading && <EmojiPicker
          title={title}
          onEmojiSelect={(emoji: any) => onReact(emoji.native)}
          recent={frequentlyUsedEmojis}
          perLine={8}
          skin={onSkinTone}
          emojiSize={22}
          emojiButtonSize={34}
          set='twitter'
          theme={theme}
          i18n={getI18n()}
        />
      ) : (
        <HStack
          className={clsx('z-[999] flex w-max max-w-[100vw] flex-wrap space-x-3 rounded-full bg-white px-3 py-2.5 shadow-lg focus:outline-none dark:bg-gray-900 dark:ring-2 dark:ring-primary-700')}
        >
          {Array.from(soapboxConfig.allowedEmoji).map((emoji, i) => (
            <EmojiButton
              key={i}
              emoji={emoji}
              onClick={onReact}
              tabIndex={visible ? 0 : -1}
            />
          ))}

          {all && (
            <IconButton
              className='text-gray-600 hover:text-gray-600 dark:hover:text-white'
              src={require('@tabler/icons/dots.svg')}
              onClick={handleExpand}
            />
          )}
        </HStack>
      )}
    </div>
  );
};

export default EmojiSelector;
