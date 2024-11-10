import searchIcon from '@tabler/icons/outline/search.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import AutosuggestAccountInput from 'soapbox/components/autosuggest-account-input.tsx';

import SvgIcon from './ui/icon/svg-icon.tsx';

const messages = defineMessages({
  placeholder: { id: 'account_search.placeholder', defaultMessage: 'Search for an account' },
});

interface IAccountSearch {
  /** Callback when a searched account is chosen. */
  onSelected: (accountId: string) => void;
  /** Override the default placeholder of the input. */
  placeholder?: string;
}

/** Input to search for accounts. */
const AccountSearch: React.FC<IAccountSearch> = ({ onSelected, ...rest }) => {
  const intl = useIntl();

  const [value, setValue] = useState('');

  const isEmpty = (): boolean => {
    return !(value.length > 0);
  };

  const clearState = () => {
    setValue('');
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    setValue(target.value);
  };

  const handleSelected = (accountId: string) => {
    clearState();
    onSelected(accountId);
  };

  const handleClear: React.MouseEventHandler = e => {
    e.preventDefault();

    if (!isEmpty()) {
      setValue('');
    }
  };

  const handleKeyDown: React.KeyboardEventHandler = e => {
    if (e.key === 'Escape') {
      document.querySelector('.ui')?.parentElement?.focus();
    }
  };

  return (
    <div className='w-full'>
      <label className='sr-only'>{intl.formatMessage(messages.placeholder)}</label>

      <div className='relative'>
        <AutosuggestAccountInput
          className='rounded-full'
          placeholder={intl.formatMessage(messages.placeholder)}
          value={value}
          onChange={handleChange}
          onSelected={handleSelected}
          onKeyDown={handleKeyDown}
          {...rest}
        />

        <div
          role='button'
          tabIndex={0}
          className='absolute inset-y-0 flex cursor-pointer items-center px-3 ltr:right-0 rtl:left-0'
          onClick={handleClear}
        >
          <SvgIcon
            src={searchIcon}
            className={clsx('size-4 text-gray-400', { hidden: !isEmpty() })}
          />

          <SvgIcon
            src={xIcon}
            className={clsx('size-4 text-gray-400', { hidden: isEmpty() })}
            aria-label={intl.formatMessage(messages.placeholder)}
          />
        </div>
      </div>
    </div>
  );
};

export default AccountSearch;
