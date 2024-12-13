import backspaceIcon from '@tabler/icons/outline/backspace.svg';
import searchIcon from '@tabler/icons/outline/search.svg';
import clsx from 'clsx';
import { throttle } from 'es-toolkit';
import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import { useCallback, useEffect, useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { locationSearch } from 'soapbox/actions/events.ts';
import AutosuggestInput, { AutoSuggestion } from 'soapbox/components/autosuggest-input.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

import AutosuggestLocation from './autosuggest-location.tsx';

const noOp = () => {};

const messages = defineMessages({
  placeholder: { id: 'location_search.placeholder', defaultMessage: 'Find an address' },
});

interface ILocationSearch {
  onSelected: (locationId: string) => void;
}

const LocationSearch: React.FC<ILocationSearch> = ({ onSelected }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const [locationIds, setLocationIds] = useState(ImmutableOrderedSet<string>());
  const controller = useRef(new AbortController());

  const [value, setValue] = useState('');

  const isEmpty = (): boolean => {
    return !(value.length > 0);
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    refreshCancelToken();
    handleLocationSearch(target.value);
    setValue(target.value);
  };

  const handleSelected = (_tokenStart: number, _lastToken: string | null, suggestion: AutoSuggestion) => {
    if (typeof suggestion === 'string') {
      onSelected(suggestion);
    }
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

  const refreshCancelToken = () => {
    controller.current.abort();
    controller.current = new AbortController();
  };

  const clearResults = () => {
    setLocationIds(ImmutableOrderedSet());
  };

  const handleLocationSearch = useCallback(throttle(q => {
    dispatch(locationSearch(q, controller.current.signal))
      .then((locations: { origin_id: string }[]) => {
        const locationIds = locations.map(location => location.origin_id);
        setLocationIds(ImmutableOrderedSet(locationIds));
      })
      .catch(noOp);

  }, 900, { edges: ['leading', 'trailing'] }), []);

  useEffect(() => {
    if (value === '') {
      clearResults();
    }
  }, [value]);

  return (
    <div className='relative'>
      <AutosuggestInput
        className='rounded-full'
        placeholder={intl.formatMessage(messages.placeholder)}
        value={value}
        onChange={handleChange}
        suggestions={Array.from(locationIds)}
        onSuggestionsFetchRequested={noOp}
        onSuggestionsClearRequested={noOp}
        onSuggestionSelected={handleSelected}
        searchTokens={[]}
        onKeyDown={handleKeyDown}
        renderSuggestion={AutosuggestLocation}
      />
      <div role='button' tabIndex={0} className='focus:!outline-0' onClick={handleClear}>
        <SvgIcon src={searchIcon} className={clsx('pointer-events-none absolute right-4 top-1/2 z-[2] inline-block size-[18px] -translate-y-1/2 cursor-default text-gray-400 opacity-0 rtl:left-4 rtl:right-auto', { 'opacity-100': isEmpty() })} />
        <SvgIcon src={backspaceIcon} className={clsx('pointer-events-none absolute right-4 top-1/2 z-[2] inline-block size-[22px] -translate-y-1/2 cursor-pointer text-gray-400 opacity-0 rtl:left-4 rtl:right-auto', { 'pointer-events-auto opacity-100': !isEmpty() })} aria-label={intl.formatMessage(messages.placeholder)} />
      </div>
    </div>
  );
};

export default LocationSearch;
