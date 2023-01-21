import classNames from 'clsx';
import React, { useEffect, useState } from 'react';

import { Emoji, HStack, IconButton } from 'soapbox/components/ui';
import { Picker } from 'soapbox/features/emoji/emoji-picker';

interface IEmojiButton {
  /** Unicode emoji character. */
  emoji: string,
  /** Event handler when the emoji is clicked. */
  onClick: React.EventHandler<React.MouseEvent>,
  /** Extra class name on the <button> element. */
  className?: string,
  /** Tab order of the button. */
  tabIndex?: number,
}

/** Clickable emoji button that scales when hovered. */
const EmojiButton: React.FC<IEmojiButton> = ({ emoji, className, onClick, tabIndex }): JSX.Element => {
  return (
    <button className={classNames(className)} onClick={onClick} tabIndex={tabIndex}>
      <Emoji className='w-8 h-8 duration-100 hover:scale-125' emoji={emoji} />
    </button>
  );
};

interface IEmojiSelector {
  /** List of Unicode emoji characters. */
  emojis: Iterable<string>,
  /** Event handler when an emoji is clicked. */
  onReact: (emoji: string) => void,
  /** Whether the selector should be visible. */
  visible?: boolean,
  /** Whether the selector should be focused. */
  focused?: boolean,
  /** Whether to allow any emoji to be chosen. */
  all?: boolean,
}

/** Panel with a row of emoji buttons. */
const EmojiSelector: React.FC<IEmojiSelector> = ({
  emojis,
  onReact,
  visible = false,
  focused = false,
  all = true,
}): JSX.Element => {
  const [expanded, setExpanded] = useState(false);

  const handleReact = (emoji: string): React.EventHandler<React.MouseEvent> => {
    return (e) => {
      onReact(emoji);
      e.preventDefault();
      e.stopPropagation();
    };
  };

  const handleExpand: React.MouseEventHandler = () => {
    setExpanded(true);
  };

  useEffect(() => {
    setExpanded(false);
  }, [visible, focused]);

  if (expanded) {
    return <Picker />;
  }

  return (
    <HStack
      className={classNames('gap-2 bg-white dark:bg-gray-900 p-3 rounded-full shadow-md z-[999] w-max max-w-[100vw] flex-wrap')}
    >
      {Array.from(emojis).map((emoji, i) => (
        <EmojiButton
          key={i}
          emoji={emoji}
          onClick={handleReact(emoji)}
          tabIndex={(visible || focused) ? 0 : -1}
        />
      ))}

      {all && (
        <IconButton
          src={require('@tabler/icons/dots.svg')}
          onClick={handleExpand}
        />
      )}
    </HStack>
  );
};

export default EmojiSelector;
