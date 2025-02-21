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
  MediaFilter,
  PlatformFilters,
  RepliesFilter,
  generateFilter,
} from 'soapbox/features/search/components/filters.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

const messages = defineMessages({
  filters: { id: 'column.explorer.filters', defaultMessage: 'Filters:' },
  showReplies: { id: 'column.explorer.filters.show_replies', defaultMessage: 'Show replies:' },
  language: { id: 'column.explorer.filters.language', defaultMessage: 'Language:' },
  platforms: { id: 'column.explorer.filters.platforms', defaultMessage: 'Platforms:' },
  createYourFilter: { id: 'column.explorer.filters.create_your_filter', defaultMessage: 'Create your filter' },
  filterByWords: { id: 'column.explorer.filters.filter_by_words', defaultMessage: 'Filter by this/these words' },
  include: { id: 'column.explorer.filters.include', defaultMessage: 'Include' },
  exclude: { id: 'column.explorer.filters.exclude', defaultMessage: 'Exclude' },
  nostr: { id: 'column.explorer.filters.nostr', defaultMessage: 'Nostr' },
  bluesky: { id: 'column.explorer.filters.bluesky', defaultMessage: 'Bluesky' },
  fediverse: { id: 'column.explorer.filters.fediverse', defaultMessage: 'Fediverse' },
  cancel: { id: 'column.explorer.filters.cancel', defaultMessage: 'Cancel' },
  addFilter: { id: 'column.explorer.filters.add_filter', defaultMessage: 'Add Filter' },
});

interface IGenerateFilter {
  name: string;
  state: boolean | null;
  value: string;
}

const ExplorerFilter = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);

  const [tagFilters, setTagFilters] = useState<IGenerateFilter[]>([
    { 'name': 'Nostr', state: null, 'value': 'protocol:nostr' },
    { 'name': 'Bluesky', state: null, 'value': 'protocol:atproto' },
    { 'name': 'Fediverse', state: null, 'value': 'protocol:activitypub' },
  ]);

  useEffect(
    () => {

      const value = tagFilters
        .filter((searchFilter) => !searchFilter.value.startsWith('protocol:'))
        .map((searchFilter) => searchFilter.value)
        .join(' ');

      dispatch(changeSearch(value));
      dispatch(submitSearch(undefined, value));
    }, [tagFilters, dispatch],
  );

  return (
    <Stack className='px-4' space={3}>

      {/* Filters */}
      <HStack alignItems='start' justifyContent='between' space={1}>
        <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
          <Text size='lg' weight='bold'>
            {intl.formatMessage(messages.filters)}
          </Text>

          {tagFilters.length > 0 && [...tagFilters.slice(0, 3).filter((x)=> x.value[0] !== '-' && x.state === null).map((value) => generateFilter(value, setTagFilters)), ...tagFilters.slice(3).map((value) => generateFilter(value, setTagFilters))]}

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
        <RepliesFilter onChangeFilters={setTagFilters} />

        {/* Media toggle */}
        <MediaFilter onChangeFilters={setTagFilters} />

        {/* Language */}
        <LanguageFilter onChangeFilters={setTagFilters} />

        {/* Platforms */}
        <PlatformFilters onChangeFilters={setTagFilters} filters={tagFilters} />

        <Divider />

        {/* Create your filter */}
        <CreateFilter onChangeFilters={setTagFilters} />

      </Stack>

    </Stack>
  );
};


export default ExplorerFilter;
export type { IGenerateFilter };