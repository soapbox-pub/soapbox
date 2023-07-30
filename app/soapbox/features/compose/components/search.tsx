import clsx from 'clsx';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import {
  changeSearch,
  clearSearch,
  clearSearchResults,
  setSearchAccount,
  showSearch,
  submitSearch,
} from 'soapbox/actions/search';
import AutosuggestAccountInput from 'soapbox/components/autosuggest-account-input';
import { Input } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { selectAccount } from 'soapbox/selectors';
import { AppDispatch, RootState } from 'soapbox/store';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  action: { id: 'search.action', defaultMessage: 'Search for “{query}”' },
});

function redirectToAccount(accountId: string, routerHistory: any) {
  return (_dispatch: AppDispatch, getState: () => RootState) => {
    const acct = selectAccount(getState(), accountId)!.acct;

    if (acct && routerHistory) {
      routerHistory.push(`/@${acct}`);
    }
  };
}

interface ISearch {
  autoFocus?: boolean
  autoSubmit?: boolean
  autosuggest?: boolean
  openInRoute?: boolean
}

const Search = (props: ISearch) => {
  const {
    autoFocus = false,
    autoSubmit = false,
    autosuggest = false,
    openInRoute = false,
  } = props;

  const dispatch = useAppDispatch();
  const history = useHistory();
  const intl = useIntl();

  const value = useAppSelector((state) => state.search.value);
  const submitted = useAppSelector((state) => state.search.submitted);

  const debouncedSubmit = useCallback(debounce(() => {
    dispatch(submitSearch());
  }, 900), []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    dispatch(changeSearch(value));

    if (autoSubmit) {
      debouncedSubmit();
    }
  };

  const handleClear = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (value.length > 0 || submitted) {
      dispatch(clearSearchResults());
    }
  };

  const handleSubmit = () => {
    if (openInRoute) {
      dispatch(setSearchAccount(null));
      dispatch(submitSearch());

      history.push('/search');
    } else {
      dispatch(submitSearch());
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();

      handleSubmit();
    } else if (event.key === 'Escape') {
      document.querySelector('.ui')?.parentElement?.focus();
    }
  };

  const handleFocus = () => {
    dispatch(showSearch());
  };

  const handleSelected = (accountId: string) => {
    dispatch(clearSearch());
    dispatch(redirectToAccount(accountId, history));
  };

  const makeMenu = () => [
    {
      text: intl.formatMessage(messages.action, { query: value }),
      icon: require('@tabler/icons/search.svg'),
      action: handleSubmit,
    },
  ];

  const hasValue = value.length > 0 || submitted;
  const componentProps: any = {
    type: 'text',
    id: 'search',
    placeholder: intl.formatMessage(messages.placeholder),
    value,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    autoFocus: autoFocus,
    theme: 'search',
    className: 'pr-10 rtl:pl-10 rtl:pr-3',
  };

  if (autosuggest) {
    componentProps.onSelected = handleSelected;
    componentProps.menu = makeMenu();
    componentProps.autoSelect = false;
  }

  useEffect(() => {
    return () => {
      const newPath = history.location.pathname;
      const shouldPersistSearch = !!newPath.match(/@.+\/posts\/[a-zA-Z0-9]+/g)
        || !!newPath.match(/\/tags\/.+/g);

      if (!shouldPersistSearch) {
        dispatch(changeSearch(''));
      }
    };
  }, []);

  return (
    <div className='w-full'>
      <label htmlFor='search' className='sr-only'>{intl.formatMessage(messages.placeholder)}</label>

      <div className='relative'>
        {autosuggest ? (
          <AutosuggestAccountInput {...componentProps} />
        ) : (
          <Input {...componentProps} />
        )}

        <div
          role='button'
          tabIndex={0}
          className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
          onClick={handleClear}
        >
          <SvgIcon
            src={require('@tabler/icons/search.svg')}
            className={clsx('h-4 w-4 text-gray-600', { hidden: hasValue })}
          />

          <SvgIcon
            src={require('@tabler/icons/x.svg')}
            className={clsx('h-4 w-4 text-gray-600', { hidden: !hasValue })}
            aria-label={intl.formatMessage(messages.placeholder)}
          />
        </div>
      </div>
    </div>
  );
};

export default Search;
