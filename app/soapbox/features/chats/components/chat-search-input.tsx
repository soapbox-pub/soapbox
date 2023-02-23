import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Icon, Input } from 'soapbox/components/ui';

const messages = defineMessages({
  searchPlaceholder: { id: 'chats.search_placeholder', defaultMessage: 'Search inbox' },
});

interface IChatSearchInput {
  /** Search term. */
  value: string
  /** Callback when the search value changes. */
  onChange: React.ChangeEventHandler<HTMLInputElement>
  /** Callback when the input is cleared. */
  onClear: React.MouseEventHandler<HTMLButtonElement>
}

/** Search input for filtering chats. */
const ChatSearchInput: React.FC<IChatSearchInput> = ({ value, onChange, onClear }) => {
  const intl = useIntl();

  return (
    <Input
      data-testid='chat-search-input'
      type='text'
      autoFocus
      placeholder={intl.formatMessage(messages.searchPlaceholder)}
      className='rounded-full'
      value={value}
      onChange={onChange}
      outerClassName='mt-0'
      theme='search'
      append={
        <button onClick={onClear}>
          <Icon
            src={value.length ? require('@tabler/icons/x.svg') : require('@tabler/icons/search.svg')}
            className='h-4 w-4 text-gray-700 dark:text-gray-600'
            aria-hidden='true'
          />
        </button>
      }
    />
  );
};

export default ChatSearchInput;