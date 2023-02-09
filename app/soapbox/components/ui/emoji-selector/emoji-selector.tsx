import { Placement } from '@popperjs/core';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { usePopper } from 'react-popper';

import { Emoji, HStack, IconButton } from 'soapbox/components/ui';
import { Picker } from 'soapbox/features/emoji/emoji-picker';
import { useSoapboxConfig } from 'soapbox/hooks';

interface IEmojiButton {
  /** Unicode emoji character. */
  emoji: string,
  /** Event handler when the emoji is clicked. */
  onClick(emoji: string): void
  /** Extra class name on the <button> element. */
  className?: string,
  /** Tab order of the button. */
  tabIndex?: number,
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
  all = true,
}): JSX.Element => {
  const soapboxConfig = useSoapboxConfig();

  const [expanded, setExpanded] = useState(false);

  // `useRef` won't trigger a re-render, while `useState` does.
  // https://popper.js.org/react-popper/v2/
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (referenceElement?.contains(event.target as Node) || popperElement?.contains(event.target as Node)) {
      return;
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
          offset: [-10, 0],
        },
      },
    ],
  });

  const handleExpand: React.MouseEventHandler = () => {
    setExpanded(true);
  };

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

  return (
    <div
      className={clsx('z-50 transition-opacity duration-100', {
        'opacity-0 pointer-events-none': !visible,
      })}
      ref={setPopperElement}
      style={styles.popper}
      {...attributes.popper}
    >
      {expanded ? (
        <Picker
          set='twitter'
          backgroundImageFn={() => require('emoji-datasource/img/twitter/sheets/32.png')}
          onClick={(emoji: any) => onReact(emoji.native)}
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
