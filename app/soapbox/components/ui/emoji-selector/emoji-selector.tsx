import { shift, useFloating, Placement, offset, OffsetOptions } from '@floating-ui/react';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';

import { Emoji as EmojiComponent, HStack, IconButton } from 'soapbox/components/ui';
import EmojiPickerDropdown from 'soapbox/features/emoji/components/emoji-picker-dropdown';
import { useClickOutside, useFeatures, useSoapboxConfig } from 'soapbox/hooks';

import type { Emoji } from 'soapbox/features/emoji';

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
      <EmojiComponent className='h-6 w-6 duration-100 hover:scale-110' emoji={emoji} />
    </button>
  );
};

interface IEmojiSelector {
  onClose?(): void
  /** Event handler when an emoji is clicked. */
  onReact(emoji: string, custom?: string): void
  /** Element that triggers the EmojiSelector Popper */
  referenceElement: HTMLElement | null
  placement?: Placement
  /** Whether the selector should be visible. */
  visible?: boolean
  offsetOptions?: OffsetOptions
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
  offsetOptions,
  all = true,
}): JSX.Element => {
  const soapboxConfig = useSoapboxConfig();
  const { customEmojiReacts } = useFeatures();

  const [expanded, setExpanded] = useState(false);

  const { x, y, strategy, refs, update } = useFloating<HTMLElement>({
    placement,
    middleware: [offset(offsetOptions), shift()],
  });

  const handleExpand: React.MouseEventHandler = () => {
    setExpanded(true);
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
    if (onClose) {
      onClose();
    }
  });

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
