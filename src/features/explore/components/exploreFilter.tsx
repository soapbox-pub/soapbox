import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import { debounce } from 'es-toolkit';
import { useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSearch, submitSearch } from 'soapbox/actions/search.ts';
import Divider from 'soapbox/components/ui/divider.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import {
  WordFilter,
  LanguageFilter,
  MediaFilter,
  PlatformFilters,
  ToggleRepliesFilter,
} from 'soapbox/features/explore/components/filters.tsx';
import { useSearchTokens } from 'soapbox/features/explore/useSearchTokens.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

const messages = defineMessages({
  allMedia: { id: 'column.explore.media_filters.all_media', defaultMessage: 'All media' },
  imageOnly: { id: 'column.explore.media_filters.image', defaultMessage: 'Image only' },
  videoOnly: { id: 'column.explore.media_filters.video', defaultMessage: 'Video only' },
  noMedia: { id: 'column.explore.media_filters.no_media', defaultMessage: 'No media' },
  showReplies: { id: 'home.column_settings.show_replies', defaultMessage: 'Show replies' },
  nostr: { id: 'column.explore.filters.nostr', defaultMessage: 'Nostr' },
  atproto: { id: 'column.explore.filters.bluesky', defaultMessage: 'Bluesky' },
  activitypub: { id: 'column.explore.filters.fediverse', defaultMessage: 'Fediverse' },
  removeFilter: { id: 'column.explore.filters.remove_filter', defaultMessage: 'Remove filter' },
});

const ExploreFilter = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { tokens, addToken, removeToken, removeTokens } = useSearchTokens();
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
      debouncedSearch([...tokens].join(' '));

      return () => {
        debouncedSearch.cancel();
      };

    }, [tokens, dispatch],
  );

  useEffect(
    () => {
      const isOpenStatus = localStorage.getItem('soapbox:explore:filter:status');
      if (isOpenStatus !== null) {
        setIsOpen(JSON.parse(isOpenStatus));
      }
    }
    , []);

  const filters = new Set<string>(['protocol:nostr', 'protocol:atproto', 'protocol:activitypub']);

  for (const token of tokens) {
    if (token.startsWith('-protocol:')) {
      filters.delete(token.replace(/^-/, ''));
    }
    filters.add(token);
  }

  function renderMediaFilter(): JSX.Element | null {
    const clearMediaFilters = () => removeTokens(['media:true', '-video:true', 'video:true', '-media:true']);

    if (tokens.has('media:true') && tokens.has('-video:true')) {
      return (
        <FilterToken
          label={intl.formatMessage(messages.imageOnly)}
          textColor='text-blue-500'
          borderColor='border-blue-500'
          onRemove={clearMediaFilters}
        />
      );
    }

    if (tokens.has('video:true')) {
      return (
        <FilterToken
          label={intl.formatMessage(messages.videoOnly)}
          textColor='text-blue-500'
          borderColor='border-blue-500'
          onRemove={clearMediaFilters}
        />
      );
    }

    if (tokens.has('-media:true')) {
      return (
        <FilterToken
          label={intl.formatMessage(messages.noMedia)}
          textColor='text-blue-500'
          borderColor='border-blue-500'
          onRemove={clearMediaFilters}
        />
      );
    }

    return null;
  }

  return (
    <Stack className='px-4' space={3}>
      <HStack alignItems='start' justifyContent='between' space={1}>
        <HStack className='flex-wrap whitespace-normal' alignItems='center'>
          {!tokens.has('-protocol:nostr') ? (
            <FilterToken
              label={intl.formatMessage(messages.nostr)}
              textColor='text-purple-500'
              borderColor='border-purple-500'
              onRemove={() => addToken('-protocol:nostr')}
            />
          ) : null}

          {!tokens.has('-protocol:atproto') ? (
            <FilterToken
              label={intl.formatMessage(messages.atproto)}
              textColor='text-blue-500'
              borderColor='border-blue-500'
              onRemove={() => addToken('-protocol:atproto')}
            />
          ) : null}

          {!tokens.has('-protocol:activitypub') ? (
            <FilterToken
              label={intl.formatMessage(messages.activitypub)}
              textColor='text-indigo-500'
              borderColor='border-indigo-500'
              onRemove={() => addToken('-protocol:activitypub')}
            />
          ) : null}

          {renderMediaFilter()}

          {[...filters].filter((token) => token.startsWith('language:')).map((token) => (
            <FilterToken
              key={token}
              label={token.replace('language:', '')}
              textColor='text-gray-500'
              borderColor='border-gray-500'
              onRemove={() => removeToken(token)}
            />
          ))}

          {[...filters].filter((token) => !token.includes(':')).map((token) => (
            <FilterToken
              key={token}
              label={token}
              textColor='text-green-500'
              borderColor='border-green-600'
              onRemove={() => removeToken(token)}
            />
          ))}
        </HStack>
        <IconButton
          src={arrowIcon}
          theme='transparent'
          className={`transition-transform duration-300 ${ isOpen ? 'rotate-180' : 'rotate-0'}`}
          onClick={handleClick}
        />
      </HStack>

      <Stack className={`overflow-hidden transition-all duration-500 ease-in-out  ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`} space={3}>
        <ToggleRepliesFilter />
        <MediaFilter />
        <LanguageFilter />
        <PlatformFilters />

        <Divider />

        <WordFilter />
      </Stack>
    </Stack>
  );
};

interface IFilterToken {
  label: string;
  textColor: string;
  borderColor: string;
  onRemove: () => void;
}

const FilterToken: React.FC<IFilterToken> = ({ label, textColor, borderColor, onRemove }) => {
  const intl = useIntl();

  const handleChangeFilters = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <div className={`group m-1 flex items-center whitespace-normal break-words rounded-full border-2 bg-transparent px-3 pr-1 text-base font-medium shadow-sm hover:cursor-pointer ${borderColor} ${textColor}`}>
      {label}
      <IconButton
        iconClassName='!w-4' className={`!py-0 group-hover:block ${textColor}`} src={xIcon}
        onClick={handleChangeFilters}
        aria-label={intl.formatMessage(messages.removeFilter)}
      />
    </div>
  );
};

export default ExploreFilter;
