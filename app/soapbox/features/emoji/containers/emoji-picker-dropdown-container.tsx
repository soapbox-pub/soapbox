import clsx from 'clsx';
import { supportsPassiveEvents } from 'detect-passive-events';
import React, { KeyboardEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { defineMessages, useIntl } from 'react-intl';
import { usePopper } from 'react-popper';

import { IconButton } from 'soapbox/components/ui';
import { isMobile } from 'soapbox/is-mobile';

import EmojiPickerDropdown, { IEmojiPickerDropdown } from '../components/emoji-picker-dropdown';

const listenerOptions = supportsPassiveEvents ? { passive: true } : false;

export const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
});

const EmojiPickerDropdownContainer = (
  props: Pick<IEmojiPickerDropdown, 'onPickEmoji' | 'condensed' | 'withCustom'>,
) => {
  const intl = useIntl();
  const title = intl.formatMessage(messages.emoji);

  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [popperReference, setPopperReference] = useState<HTMLButtonElement | null>(null);
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);

  const [visible, setVisible] = useState(false);

  const placement = props.condensed ? 'bottom-start' : 'top-start';
  const { styles, attributes, update } = usePopper(popperReference, popperElement, {
    placement: isMobile(window.innerWidth) ? 'auto' : placement,
  });

  const handleDocClick = (e: any) => {
    if (!containerElement?.contains(e.target) && !popperElement?.contains(e.target)) {
      setVisible(false);
    }
  };

  const handleToggle = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    setVisible(!visible);
  };

  // TODO: move to class
  const style: React.CSSProperties = !isMobile(window.innerWidth) ? styles.popper : {
    ...styles.popper, width: '100%',
  };

  useEffect(() => {
    document.addEventListener('click', handleDocClick, false);
    document.addEventListener('touchend', handleDocClick, listenerOptions);

    return () => {
      document.removeEventListener('click', handleDocClick, false);
      // @ts-ignore
      document.removeEventListener('touchend', handleDocClick, listenerOptions);
    };
  });

  return (
    <div className='relative' ref={setContainerElement}>
      <IconButton
        className={clsx({
          'text-gray-600 hover:text-gray-700 dark:hover:text-gray-500': true,
        })}
        ref={setPopperReference}
        src={require('@tabler/icons/mood-happy.svg')}
        title={title}
        aria-label={title}
        aria-expanded={visible}
        role='button'
        onClick={handleToggle as any}
        onKeyDown={handleToggle as React.KeyboardEventHandler<HTMLButtonElement>}
        tabIndex={0}
      />

      {createPortal(
        <div
          className='z-[101]'
          ref={setPopperElement}
          style={style}
          {...attributes.popper}
        >
          <EmojiPickerDropdown visible={visible} setVisible={setVisible} update={update} {...props} />
        </div>,
        document.body,
      )}
    </div>
  );
};


export default EmojiPickerDropdownContainer;
