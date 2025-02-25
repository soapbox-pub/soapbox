import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSearch, submitSearch } from 'soapbox/actions/search.ts';
import Divider from 'soapbox/components/ui/divider.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import {
  CreateFilter,
  LanguageFilter,
  PlatformFilters,
  ToggleFilter,
  generateFilter,
} from 'soapbox/features/explorer/components/filters.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

const messages = defineMessages({
  filters: { id: 'column.explorer.filters', defaultMessage: 'Filters:' },
});

interface IGenerateFilter {
  name: string;
  status: boolean | null;
  value: string;
}

const ExplorerFilter = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.search_filter);
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(
    () => {
      const language = filters[0].name.toLowerCase() !== 'default' ? filters[0].value : '';
      const protocols = filters.slice(1, 4).filter((protocol) => !protocol.status).map((filter) => filter.value).join(' ');
      const defaultFilters = filters.slice(4, 7).filter((x) => x.status).map((filter) => filter.value).join(' ');
      const newFilters = filters.slice(7)
        .map((searchFilter) => searchFilter.value)
        .join(' ');

      const value = [ language, protocols, defaultFilters, newFilters ].join(' ');

      dispatch(changeSearch(value));
      dispatch(submitSearch(undefined, value));
    }, [filters, dispatch],
  );

  return (
    <Stack className='px-4' space={3}>

      {/* Filters */}
      <HStack alignItems='start' justifyContent='between' space={1}>
        <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
          <Text size='lg' weight='bold'>
            {intl.formatMessage(messages.filters)}
          </Text>

          {filters.length > 0 && [...filters.slice(0, 7).filter((value) => value.status).map((value) => generateFilter(dispatch, value)), ...filters.slice(7).map((value) => generateFilter(dispatch, value))]}

        </HStack>
        <IconButton
          src={arrowIcon}
          theme='transparent'
          className={`transition-transform duration-300 ${ isOpen ? 'rotate-180' : 'rotate-0'}`}
          onClick={() => setIsOpen(!isOpen)}
        />
      </HStack>

      <Stack className={`overflow-hidden transition-all duration-500 ease-in-out  ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`} space={3}>

        {/* Show Reply toggle */}
        <ToggleFilter type='reply' />

        {/* Media toggle */}
        <ToggleFilter type='media' />

        {/* Video toggle */}
        <ToggleFilter type='video' />

        {/* Language */}
        <LanguageFilter />

        {/* Platforms */}
        <PlatformFilters />

        <Divider />

        {/* Create your filter */}
        <CreateFilter />

      </Stack>

    </Stack>
  );
};


export default ExplorerFilter;
export type { IGenerateFilter };