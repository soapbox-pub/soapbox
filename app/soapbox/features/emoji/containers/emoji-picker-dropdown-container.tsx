import { useFloating, shift } from '@floating-ui/react';
import clsx from 'clsx';
import React, { KeyboardEvent, useState } from 'react';
import { createPortal } from 'react-dom';
import { defineMessages, useIntl } from 'react-intl';

import { IconButton } from 'soapbox/components/ui';
import { useClickOutside } from 'soapbox/hooks';

import EmojiPickerDropdown, { IEmojiPickerDropdown } from '../components/emoji-picker-dropdown';

export const messages = defineMessages({
  emoji: { id: 'emoji_button.label', defaultMessage: 'Insert emoji' },
});

const EmojiPickerDropdownContainer = (
  props: Pick<IEmojiPickerDropdown, 'onPickEmoji' | 'condensed' | 'withCustom'>,
) => {
  const intl = useIntl();
  const title = intl.formatMessage(messages.emoji);

  const [visible, setVisible] = useState(false);

  const { x, y, strategy, refs, update } = useFloating<HTMLButtonElement>({
    middleware: [shift()],
  });

  useClickOutside(refs, () => {
    setVisible(false);
  });

  const handleToggle = (e: MouseEvent | KeyboardEvent) => {
    e.stopPropagation();
    setVisible(!visible);
  };

  return (
    <div className='relative'>
      <IconButton
        className={clsx({
          'text-gray-600 hover:text-gray-700 dark:hover:text-gray-500': true,
        })}
        ref={refs.setReference}
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
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
            width: 'max-content',
          }}
        >
          <EmojiPickerDropdown
            visible={visible}
            setVisible={setVisible}
            update={update}
            {...props}
          />
        </div>,
        document.body,
      )}
    </div>
  );
};


export default EmojiPickerDropdownContainer;
