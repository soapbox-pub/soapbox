import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import { debounce } from 'es-toolkit';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';

import { changeSearch, submitSearch } from 'soapbox/actions/search.ts';
import Divider from 'soapbox/components/ui/divider.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import {
  CreateFilter,
  LanguageFilter,
  MediaFilter,
  PlatformFilters,
  ToggleRepliesFilter,
  generateFilter,
} from 'soapbox/features/explore/components/filters.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { IFilters } from 'soapbox/reducers/search-filter.ts';

interface IGenerateFilter {
  name: string;
  status: boolean | null;
  value: string;
}

export const formatFilters = (filters: IFilters[]): string => {
  const language = filters[0].name.toLowerCase() !== 'default' ? filters[0].value : '';
  const protocols = filters.slice(1, 4).filter((protocol) => !protocol.status).map((filter) => filter.value).join(' ');
  const defaultFilters = filters.slice(4, 8).filter((x) => x.status).map((filter) => filter.value).join(' ');
  const newFilters = filters.slice(8).map((searchFilter) => searchFilter.value).join(' ');

  return [language, protocols, defaultFilters, newFilters].join(' ').trim();
};

const ExploreFilter = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.search_filter);
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem('soapbox:explore:filter:status', JSON.stringify(newValue));
      return newValue;
    });
  };

  const debouncedSearch = useMemo(
    () => debounce((value: string) => {
      dispatch(changeSearch(value));
      dispatch(submitSearch(undefined, value));
    }, 300),
    [dispatch],
  );

  useEffect(
    () => {
      const value = formatFilters(filters);

      localStorage.setItem('soapbox:explore:filters', JSON.stringify(filters));

      debouncedSearch(value);

      return () => {
        debouncedSearch.cancel();
      };

    }, [filters, dispatch],
  );

  useEffect(
    () => {
      const isOpenStatus = localStorage.getItem('soapbox:explore:filter:status');
      if (isOpenStatus !== null) {
        setIsOpen(JSON.parse(isOpenStatus));
      }
    }
    , []);

  return (
    <Stack className='px-4' space={3}>

      {/* Filters */}
      <HStack alignItems='start' justifyContent='between' space={1}>
        <HStack className='flex-wrap whitespace-normal' alignItems='center'>
          {filters.length > 0 && [...filters.slice(0, 8).filter((value) => value.status).map((value) => generateFilter(dispatch, intl, value)), ...filters.slice(8).map((value) => generateFilter(dispatch, intl, value))]}

        </HStack>
        <IconButton
          src={arrowIcon}
          theme='transparent'
          className={`transition-transform duration-300 ${ isOpen ? 'rotate-180' : 'rotate-0'}`}
          onClick={handleClick}
        />
      </HStack>

      <Stack className={`overflow-hidden transition-all duration-500 ease-in-out  ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`} space={3}>

        {/* Show Reply toggle */}
        <ToggleRepliesFilter />

        {/* Media toggle */}
        <MediaFilter />

        {/* Language */}
        <LanguageFilter />

        {/* Platforms */}
        <PlatformFilters />

        <Divider />

        {/* Create your filter */}
        <CreateFilter />

        <Divider />
        {/* Reset your filters */}

      </Stack>

    </Stack>
  );
};


export default ExploreFilter;
export type { IGenerateFilter };