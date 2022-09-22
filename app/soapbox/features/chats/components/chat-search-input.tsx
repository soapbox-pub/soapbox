import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Icon, Input } from 'soapbox/components/ui';
import { useDebounce } from 'soapbox/hooks';

const messages = defineMessages({
  searchPlaceholder: { id: 'chats.search_placeholder', defaultMessage: 'Search inbox' },
});

interface IChatSearchInput {
  /** Search term. */
  value: string,
  /** Callback when the search value changes. */
  onChange: React.ChangeEventHandler<HTMLInputElement>,
  /** Callback when the input is cleared. */
  onClear: React.MouseEventHandler<HTMLButtonElement>,
}

/** Search input for filtering chats. */
const ChatSearchInput: React.FC<IChatSearchInput> = ({ value, onChange, onClear }) => {
  const intl = useIntl();

  const debouncedValue = useDebounce(value, 300);
  const hasSearchValue = Number(debouncedValue?.length) > 0;

  return (
    <Input
      type='text'
      autoFocus
      placeholder={intl.formatMessage(messages.searchPlaceholder)}
      className='rounded-full'
      value={value}
      onChange={onChange}
      isSearch
      append={
        <button onClick={onClear}>
          <Icon
            src={hasSearchValue ? require('@tabler/icons/x.svg') : require('@tabler/icons/search.svg')}
            className='h-4 w-4 text-gray-700 dark:text-gray-600'
            aria-hidden='true'
          />
        </button>
      }
    />
  );
};

export default ChatSearchInput;