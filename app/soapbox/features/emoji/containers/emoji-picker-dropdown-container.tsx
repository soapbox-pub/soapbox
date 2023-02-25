import clsx from 'clsx';
import React from 'react';

import { IconButton } from 'soapbox/components/ui';

import EmojiPickerDropdown, { IEmojiPickerDropdown } from '../components/emoji-picker-dropdown';

const EmojiPickerDropdownWrapper = (props: Omit<IEmojiPickerDropdown, 'render'>) => {
  return (
    <EmojiPickerDropdown
      render={
        ({ setPopperReference, title, visible, loading, handleToggle }: any) => (
          <IconButton
            className={clsx({
              'text-gray-400 hover:text-gray-600': true,
              'pulse-loading': visible && loading,
            })}
            ref={setPopperReference}
            src={require('@tabler/icons/mood-happy.svg')}
            title={title}
            aria-label={title}
            aria-expanded={visible}
            role='button'
            onClick={handleToggle}
            onKeyDown={handleToggle}
            tabIndex={0}
          />
        )
      }

      {...props}
    />
  );
};


export default EmojiPickerDropdownWrapper;
