import classNames from 'clsx';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { fetchAliasesSuggestions, clearAliasesSuggestions, changeAliasesSuggestions } from 'soapbox/actions/aliases';
import Icon from 'soapbox/components/icon';
import { Button } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';

const messages = defineMessages({
  search: { id: 'aliases.search', defaultMessage: 'Search your old account' },
  searchTitle: { id: 'tabs_bar.search', defaultMessage: 'Search' },
});

const Search: React.FC = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  const value = useAppSelector(state => state.aliases.suggestions.value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(changeAliasesSuggestions(e.target.value));
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      dispatch(fetchAliasesSuggestions(value));
    }
  };

  const handleSubmit = () => {
    dispatch(fetchAliasesSuggestions(value));
  };

  const handleClear = () => {
    dispatch(clearAliasesSuggestions());
  };

  const hasValue = value.length > 0;

  return (
    <div className='flex items-center gap-1'>
      <label className='flex-grow relative'>
        <span style={{ display: 'none' }}>{intl.formatMessage(messages.search)}</span>

        <input
          className='block w-full sm:text-sm dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 focus:ring-primary-500 focus:border-primary-500 rounded-full'
          type='text'
          value={value}
          onChange={handleChange}
          onKeyUp={handleKeyUp}
          placeholder={intl.formatMessage(messages.search)}
        />

        <div role='button' tabIndex={hasValue ? 0 : -1} className='search__icon' onClick={handleClear}>
          <Icon src={require('@tabler/icons/backspace.svg')} aria-label={intl.formatMessage(messages.search)} className={classNames('svg-icon--backspace', { active: hasValue })} />
        </div>
      </label>
      <Button onClick={handleSubmit}>{intl.formatMessage(messages.searchTitle)}</Button>
    </div>
  );
};

export default Search;
