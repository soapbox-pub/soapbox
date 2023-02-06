import clsx from 'clsx';
import React, { useRef } from 'react';

import { Emoji, HStack } from 'soapbox/components/ui';

interface IEmojiButton {
  /** Unicode emoji character. */
  emoji: string,
  /** Event handler when the emoji is clicked. */
  onClick: React.EventHandler<React.MouseEvent>,
  /** Keyboard event handler. */
  onKeyDown?: React.EventHandler<React.KeyboardEvent>,
  /** Extra class name on the <button> element. */
  className?: string,
  /** Tab order of the button. */
  tabIndex?: number,
}

/** Clickable emoji button that scales when hovered. */
const EmojiButton: React.FC<IEmojiButton> = ({ emoji, className, onClick, onKeyDown, tabIndex }): JSX.Element => {
  return (
    <button className={clsx(className)} onClick={onClick} tabIndex={tabIndex}>
      <Emoji className='h-8 w-8 duration-100' emoji={emoji} />
    </button>
  );
};

interface IEmojiSelector {
  /** List of Unicode emoji characters. */
  emojis: Iterable<string>,
  /** Event handler when an emoji is clicked. */
  onReact: (emoji: string) => void,
  /** Event handler when selector is escaped. */
  onUnfocus: React.KeyboardEventHandler<HTMLDivElement>,
  /** Whether the selector should be visible. */
  visible?: boolean,
  /** Whether the selector should be focused. */
  focused?: boolean,
}

/** Panel with a row of emoji buttons. */
const EmojiSelector: React.FC<IEmojiSelector> = ({ emojis, onReact, onUnfocus, visible = false, focused = false }): JSX.Element => {
  const emojiList = Array.from(emojis);
  const node = useRef<HTMLDivElement>(null);

  const handleReact = (emoji: string): React.EventHandler<React.MouseEvent> => {
    return (e) => {
      onReact(emoji);
      e.preventDefault();
      e.stopPropagation();
    };
  };

  const selectPreviousEmoji = (i: number): void => {
    if (!node.current) return;

    if (i !== 0) {
      const button: HTMLButtonElement | null = node.current.querySelector(`.emoji-react-selector__emoji:nth-child(${i})`);
      button?.focus();
    } else {
      const button: HTMLButtonElement | null = node.current.querySelector('.emoji-react-selector__emoji:last-child');
      button?.focus();
    }
  };

  const selectNextEmoji = (i: number) => {
    if (!node.current) return;

    if (i !== emojiList.length - 1) {
      const button: HTMLButtonElement | null = node.current.querySelector(`.emoji-react-selector__emoji:nth-child(${i + 2})`);
      button?.focus();
    } else {
      const button: HTMLButtonElement | null = node.current.querySelector('.emoji-react-selector__emoji:first-child');
      button?.focus();
    }
  };

  const handleKeyDown = (i: number): React.KeyboardEventHandler<HTMLDivElement> => e => {
    switch (e.key) {
      case 'Enter':
        handleReact(emojiList[i])(e as any);
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) selectPreviousEmoji(i);
        else selectNextEmoji(i);
        break;
      case 'Left':
      case 'ArrowLeft':
        selectPreviousEmoji(i);
        break;
      case 'Right':
      case 'ArrowRight':
        selectNextEmoji(i);
        break;
      case 'Escape':
        onUnfocus(e);
        break;
    }
  };

  return (
    <HStack
      className={clsx('emoji-react-selector z-[999] w-max max-w-[100vw] flex-wrap gap-2 rounded-full bg-white p-3 shadow-md dark:bg-gray-900')}
      ref={node}
    >
      {emojiList.map((emoji, i) => (
        <EmojiButton
          className='emoji-react-selector__emoji hover:scale-125 focus:scale-125'
          key={i}
          emoji={emoji}
          onClick={handleReact(emoji)}
          onKeyDown={handleKeyDown(i)}
          tabIndex={(visible || focused) ? 0 : -1}
        />
      ))}
    </HStack>
  );
};

export default EmojiSelector;
