import { shift, useFloating, Placement, offset, OffsetOptions } from '@floating-ui/react';
import dotsIcon from '@tabler/icons/outline/dots.svg';
import clsx from 'clsx';
import { useEffect, useState } from 'react';

import { chooseEmoji } from 'soapbox/actions/emojis.ts';
import { closeModal, openModal } from 'soapbox/actions/modals.ts';
import EmojiComponent from 'soapbox/components/ui/emoji.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import EmojiPickerDropdown, { getFrequentlyUsedEmojis } from 'soapbox/features/emoji/components/emoji-picker-dropdown.tsx';
import emojiData from 'soapbox/features/emoji/data.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useClickOutside } from 'soapbox/hooks/useClickOutside.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import { userTouching } from 'soapbox/is-mobile.ts';

import type { Emoji } from 'soapbox/features/emoji/index.ts';

interface IEmojiButton {
  /** Unicode emoji character. */
  emoji: string;
  /** Event handler when the emoji is clicked. */
  onClick(emoji: string): void;
  /** Extra class name on the <button> element. */
  className?: string;
  /** Tab order of the button. */
  tabIndex?: number;
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
      <div className='flex items-center justify-center duration-100 hover:scale-110'>
        <EmojiComponent size={24} emoji={emoji} />
      </div>
    </button>
  );
};

interface IEmojiSelector {
  onClose?(): void;
  /** Event handler when an emoji is clicked. */
  onReact(emoji: string, custom?: string): void;
  /** Element that triggers the EmojiSelector Popper */
  referenceElement: HTMLElement | null;
  placement?: Placement;
  /** Whether the selector should be visible. */
  visible?: boolean;
  offsetOptions?: OffsetOptions;
  /** Whether to allow any emoji to be chosen. */
  all?: boolean;
}

/** Panel with a row of emoji buttons. */
const EmojiSelector: React.FC<IEmojiSelector> = ({
  referenceElement,
  onClose,
  onReact,
  placement = 'top',
  visible = false,
  offsetOptions,
  all = true,
}): JSX.Element => {
  const { allowedEmoji } = useSoapboxConfig();
  const { customEmojiReacts } = useFeatures();
  const shortcodes = useAppSelector((state) => getFrequentlyUsedEmojis(state));

  const dispatch = useAppDispatch();
  const [expanded, setExpanded] = useState(false);

  const { x, y, strategy, refs, update } = useFloating<HTMLElement>({
    placement,
    middleware: [offset(offsetOptions), shift()],
  });

  const handleExpand: React.MouseEventHandler = () => {
    if (userTouching.matches) {
      dispatch(openModal('EMOJI_PICKER', {
        onPickEmoji: (emoji: Emoji) => {
          handlePickEmoji(emoji);
          dispatch(closeModal('EMOJI_PICKER'));
        },
      }));

      onClose?.();
    } else {
      setExpanded(true);
    }
  };

  const handleReact = (emoji: string) => {
    // Reverse lookup...
    // This is hell.
    const data = Object.values(emojiData.emojis).find((e) => e.skins.some((s) => s.native === emoji));
    const skin = data?.skins.find((s) => s.native === emoji);

    if (data && skin) {
      dispatch(chooseEmoji({
        id: data.id,
        colons: `:${data.id}:`,
        custom: false,
        native: skin.native,
        unified: skin.unified,
      }));
    }

    onReact(emoji);
  };

  const handlePickEmoji = (emoji: Emoji) => {
    onReact(emoji.custom ? emoji.id : emoji.native, emoji.custom ? emoji.imageUrl : undefined);
  };

  useEffect(() => {
    refs.setReference(referenceElement);
  }, [referenceElement]);

  useEffect(() => () => {
    document.body.style.overflow = '';
  }, []);

  useEffect(() => {
    setExpanded(false);
  }, [visible]);

  useClickOutside(refs, () => {
    onClose?.();
  });

  const recentEmojis = shortcodes.reduce<string[]>((results, shortcode) => {
    const emoji = emojiData.emojis[shortcode]?.skins[0]?.native;
    if (emoji) {
      results.push(emoji);
    }
    return results;
  }, []);

  const emojis = new Set([...recentEmojis, ...allowedEmoji]);

  return (
    <div
      className={clsx('z-[101] transition-opacity duration-100', {
        'opacity-0 pointer-events-none': !visible,
      })}
      ref={refs.setFloating}
      style={{
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        width: 'max-content',
      }}
    >
      {expanded ? (
        <EmojiPickerDropdown
          visible={expanded}
          setVisible={setExpanded}
          update={update}
          withCustom={customEmojiReacts}
          onPickEmoji={handlePickEmoji}
        />
      ) : (
        <HStack
          className={clsx('z-[999] flex w-max max-w-[100vw] flex-wrap space-x-3 rounded-full bg-white px-3 py-2.5 shadow-lg focus:outline-none dark:bg-gray-900 dark:ring-2 dark:ring-primary-700')}
        >
          {[...emojis].slice(0, 6).map((emoji, i) => (
            <EmojiButton
              key={i}
              emoji={emoji}
              onClick={handleReact}
              tabIndex={visible ? 0 : -1}
            />
          ))}

          {all && (
            <IconButton
              className='text-gray-600 hover:text-gray-600 dark:hover:text-white'
              src={dotsIcon}
              onClick={handleExpand}
            />
          )}
        </HStack>
      )}
    </div>
  );
};

export default EmojiSelector;
