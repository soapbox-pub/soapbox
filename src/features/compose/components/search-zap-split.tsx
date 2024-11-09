import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import debounce from 'lodash/debounce';
import { useCallback, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import {
  changeSearch,
  clearSearchResults,
  setSearchAccount,
  showSearch,
  submitSearch,
} from 'soapbox/actions/search';
import AutosuggestAccountInput from 'soapbox/components/autosuggest-account-input';
import { Input } from 'soapbox/components/ui';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import { useAppDispatch, useAppSelector } from 'soapbox/hooks';
import { Account } from 'soapbox/schemas';
import { selectAccount } from 'soapbox/selectors';
import { RootState } from 'soapbox/store';

const messages = defineMessages({
  placeholder: { id: 'search.placeholder', defaultMessage: 'Search' },
  action: { id: 'search.action', defaultMessage: 'Search for “{query}”' },
});

interface ISearchZapSplit {
  autoFocus?: boolean;
  autoSubmit?: boolean;
  autosuggest?: boolean;
  openInRoute?: boolean;
  onChange: (account: Account | null) => void;
}

const SearchZapSplit = (props: ISearchZapSplit) => {
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

  const getAccount = (accountId: string) => (dispatch: any, getState: () => RootState) => {
    const account = selectAccount(getState(), accountId);
    props.onChange(account!);
  };

  const handleSelected = (accountId: string) => {
    dispatch(getAccount(accountId));
  };

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
    theme: 'normal',
    className: 'pr-10 rtl:pl-10 rtl:pr-3',
  };

  if (autosuggest) {
    componentProps.onSelected = handleSelected;
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
          <Input theme='normal' {...componentProps} />
        )}

        <div
          role='button'
          tabIndex={0}
          className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
          onClick={handleClear}
        >

          <SvgIcon
            src={xIcon}
            className={clsx('size-4 text-gray-600', { hidden: !hasValue })}
            aria-label={intl.formatMessage(messages.placeholder)}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchZapSplit;
