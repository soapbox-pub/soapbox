import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import { debounce } from 'es-toolkit';
import { useEffect, useMemo, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSearch, submitSearch } from '@/actions/search.ts';
import Checkbox from '@/components/ui/checkbox.tsx';
import HStack from '@/components/ui/hstack.tsx';
import IconButton from '@/components/ui/icon-button.tsx';
import RadioButton from '@/components/ui/radio-button.tsx';
import Stack from '@/components/ui/stack.tsx';
import Text from '@/components/ui/text.tsx';
import Toggle from '@/components/ui/toggle.tsx';
import Search from '@/features/compose/components/search.tsx';
import { useSearchTokens } from '@/features/explore/useSearchTokens.ts';
import { SelectDropdown } from '@/features/forms/index.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';

const messages = defineMessages({
  explore: { id: 'column.explore.filters.explore', defaultMessage: 'Search filters' },
  includingReplies: { id: 'home.column_settings.including_replies', defaultMessage: 'Including replies' },
  withMediaType: { id: 'column.explore.filters.with_media_type', defaultMessage: 'With ONLY the media type:' },
  inLanguage: { id: 'column.explore.filters.in_language', defaultMessage: 'In the language:' },
  iWantToExplore: { id: 'column.explore.filters.i_want_to_explore', defaultMessage: 'I want to explore:' },
  iAmSearchingFor: { id: 'column.explore.filters.i_am_searching_for', defaultMessage: 'I am searching for:' },
  nostr: { id: 'column.explore.filters.nostr', defaultMessage: 'Nostr' },
  atproto: { id: 'column.explore.filters.bluesky', defaultMessage: 'Bluesky' },
  activitypub: { id: 'column.explore.filters.fediverse', defaultMessage: 'Fediverse' },
  allMedia: { id: 'column.explore.media_filters.all_media', defaultMessage: 'All media' },
  imageOnly: { id: 'column.explore.media_filters.image', defaultMessage: 'Images' },
  regularVideos: { id: 'column.explore.media_filters.regular_videos', defaultMessage: 'Regular videos' },
  shortVideos: { id: 'column.explore.media_filters.short_videos', defaultMessage: 'Short videos (Vines)' },
  noMedia: { id: 'column.explore.media_filters.no_media', defaultMessage: 'No media' },
});

const languages = {
  default: 'Global',
  en: 'English',
  ar: 'العربية',
  bg: 'Български',
  bn: 'বাংলা',
  ca: 'Català',
  co: 'Corsu',
  cs: 'Čeština',
  cy: 'Cymraeg',
  da: 'Dansk',
  de: 'Deutsch',
  el: 'Ελληνικά',
  eo: 'Esperanto',
  es: 'Español',
  eu: 'Euskara',
  fa: 'فارسی',
  fi: 'Suomi',
  fr: 'Français',
  ga: 'Gaeilge',
  gl: 'Galego',
  he: 'עברית',
  hi: 'हिन्दी',
  hr: 'Hrvatski',
  hu: 'Magyar',
  hy: 'Հայերեն',
  id: 'Bahasa Indonesia',
  io: 'Ido',
  is: 'íslenska',
  it: 'Italiano',
  ja: '日本語',
  jv: 'ꦧꦱꦗꦮ',
  ka: 'ქართული',
  kk: 'Қазақша',
  ko: '한국어',
  lt: 'Lietuvių',
  lv: 'Latviešu',
  ml: 'മലയാളം',
  ms: 'Bahasa Melayu',
  nl: 'Nederlands',
  no: 'Norsk',
  oc: 'Occitan',
  pl: 'Polski',
  pt: 'Português',
  ro: 'Română',
  ru: 'Русский',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  sq: 'Shqip',
  sr: 'Српски',
  sv: 'Svenska',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  th: 'ไทย',
  tr: 'Türkçe',
  uk: 'Українська',
  zh: '中文',
};

const ProtocolToggle: React.FC<{ protocol: 'nostr' | 'atproto' | 'activitypub' }> = ({ protocol }) => {
  const intl = useIntl();
  const { tokens, addToken, removeToken } = useSearchTokens();

  const token = `-protocol:${protocol}`;
  const checked = !tokens.has(token);
  const message = messages[protocol];

  const handleChange = () => {
    if (checked) {
      addToken(token);
    } else {
      removeToken(token);
    }
  };

  return (
    <label className='flex cursor-pointer items-center gap-2'>
      <Checkbox
        checked={checked}
        onChange={handleChange}
      />
      <Text size='md'>
        {intl.formatMessage(message)}
      </Text>
    </label>
  );
};

const ProtocolToggles = () => {
  const intl = useIntl();

  return (
    <Stack space={3}>
      <Text size='md' weight='bold'>
        {intl.formatMessage(messages.iWantToExplore)}
      </Text>
      <HStack className='flex-wrap whitespace-normal' alignItems='center' space={4}>
        <ProtocolToggle protocol='nostr' />
        <ProtocolToggle protocol='atproto' />
        <ProtocolToggle protocol='activitypub' />
      </HStack>
    </Stack>
  );
};

const MediaFilter: React.FC<{
  onVideoTypeChange: (type: 'regularVideo' | 'shortVideos') => void;
  selectedVideoType: 'regularVideo' | 'shortVideos';
}> = ({ onVideoTypeChange, selectedVideoType }) => {
  const intl = useIntl();
  const { tokens, addTokens, removeTokens } = useSearchTokens();

  const mediaFilters = {
    all: {
      tokens: [],
      label: intl.formatMessage(messages.allMedia),
    },
    image: {
      tokens: ['media:true', '-video:true'],
      label: intl.formatMessage(messages.imageOnly),
    },
    regularVideo: {
      tokens: ['video:true'],
      label: intl.formatMessage(messages.regularVideos),
    },
    shortVideos: {
      tokens: ['video:true'],
      label: intl.formatMessage(messages.shortVideos),
    },
    none: {
      tokens: ['-media:true'],
      label: intl.formatMessage(messages.noMedia),
    },
  };

  const allMediaTokens = ['media:true', '-video:true', 'video:true', '-media:true'];

  const getCurrentFilter = () => {
    if (tokens.has('-media:true')) return 'none';
    if (tokens.has('video:true')) return selectedVideoType;
    if (tokens.has('media:true') && tokens.has('-video:true')) return 'image';
    return 'all';
  };

  const currentFilter = getCurrentFilter();

  const handleMediaChange = (value: string) => {
    const filter = value as keyof typeof mediaFilters;

    // Save video type preference and notify parent
    if (filter === 'regularVideo' || filter === 'shortVideos') {
      onVideoTypeChange(filter);
      localStorage.setItem('soapbox:explore:video-type', filter);
    }

    removeTokens(allMediaTokens);
    addTokens(mediaFilters[filter].tokens);

    // Clear all scroll position data to prevent restoration
    // This ensures the page scrolls to top when switching media filters
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('soapbox:scrollData:')) {
        sessionStorage.removeItem(key);
      }
    });

    // Scroll to top when media filter changes
    window.scrollTo(0, 0);
  };

  return (
    <Stack space={3}>
      <Text size='md' weight='bold'>
        {intl.formatMessage(messages.withMediaType)}
      </Text>
      <HStack className='flex-wrap gap-y-3 pl-2' alignItems='start' space={4}>
        {Object.entries(mediaFilters).map(([key, value]) => (
          <RadioButton
            key={key}
            name='media-filter'
            value={key}
            checked={currentFilter === key}
            onChange={(e) => handleMediaChange(e.target.value)}
            label={value.label}
          />
        ))}
      </HStack>
    </Stack>
  );
};

const LanguageFilter = () => {
  const intl = useIntl();
  const { tokens, addToken, removeToken } = useSearchTokens();

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const language = e.target.value;

    // Find and remove existing language token
    const existingToken = [...tokens].find((token) => token.startsWith('language:'));
    if (existingToken) {
      removeToken(existingToken);
    }

    // Only add a new language token if not selecting 'default' (Global)
    if (language !== 'default') {
      addToken(`language:${language}`);
    }
  };

  const token = [...tokens].find((token) => token.startsWith('language:'));
  const [, language = 'default'] = token?.split(':') ?? [];

  return (
    <HStack alignItems='center' space={2}>
      <Text size='md' weight='bold'>
        {intl.formatMessage(messages.inLanguage)}
      </Text>

      <SelectDropdown
        className='max-w-[130px]'
        items={languages}
        defaultValue={language}
        onChange={handleSelectChange}
      />
    </HStack>
  );
};

const ToggleRepliesFilter = () => {
  const intl = useIntl();

  const { tokens, addToken, removeToken } = useSearchTokens();

  const handleToggle = () => {
    if (tokens.has('reply:false')) {
      removeToken('reply:false');
    } else {
      addToken('reply:false');
    }
  };

  return (
    <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
      <Text size='md' weight='bold'>
        {intl.formatMessage(messages.includingReplies)}
      </Text>
      <Toggle
        checked={!tokens.has('reply:false')}
        onChange={handleToggle}
      />
    </HStack>
  );
};

const ExploreNostr = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { tokens } = useSearchTokens();
  const [isOpen, setIsOpen] = useState(true); // Default to open
  const [selectedVideoType, setSelectedVideoType] = useState<'regularVideo' | 'shortVideos'>('regularVideo');

  const handleClick = () => {
    setIsOpen((prev) => {
      const newValue = !prev;
      localStorage.setItem('soapbox:explore:filter:status', JSON.stringify(newValue));
      return newValue;
    });
  };

  // Load the selected video type from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('soapbox:explore:video-type');
    if (saved === 'shortVideos' || saved === 'regularVideo') {
      setSelectedVideoType(saved);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce((value: string, isShortVideos: boolean) => {
      dispatch(changeSearch(value));
      dispatch(submitSearch(undefined, value, isShortVideos));
    }, 300),
    [dispatch],
  );

  useEffect(
    () => {
      const isShortVideos = tokens.has('video:true') && selectedVideoType === 'shortVideos';
      debouncedSearch([...tokens].join(' '), isShortVideos);

      return () => {
        debouncedSearch.cancel();
      };

    }, [tokens, dispatch, selectedVideoType],
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
    <Stack className='px-4 py-3' space={3}>
      {/* Search bar - always visible */}
      <Search autoSubmit />

      {/* Collapsible filters header */}
      <HStack
        alignItems='center'
        justifyContent='between'
        className='cursor-pointer'
        onClick={handleClick}
      >
        <Text size='xl' weight='bold'>
          {intl.formatMessage(messages.explore)}
        </Text>
        <IconButton
          src={arrowIcon}
          theme='transparent'
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </HStack>

      {/* Collapsible filters section */}
      <Stack className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`} space={4}>
        <ProtocolToggles />
        <ToggleRepliesFilter />
        <MediaFilter onVideoTypeChange={setSelectedVideoType} selectedVideoType={selectedVideoType} />
        <LanguageFilter />
      </Stack>
    </Stack>
  );
};

export default ExploreNostr;
