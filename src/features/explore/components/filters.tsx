import refreshIcon from '@tabler/icons/outline/refresh.svg';
import searchIcon from '@tabler/icons/outline/search.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import React, { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import Checkbox from 'soapbox/components/ui/checkbox.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Toggle from 'soapbox/components/ui/toggle.tsx';
import { useSearchTokens } from 'soapbox/features/explore/useSearchTokens.ts';
import { SelectDropdown } from 'soapbox/features/forms/index.tsx';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  showReplies: { id: 'home.column_settings.show_replies', defaultMessage: 'Show replies' },
  media: { id: 'column.explore.filters.media', defaultMessage: 'Media:' },
  language: { id: 'column.explore.filters.language', defaultMessage: 'Language:' },
  platforms: { id: 'column.explore.filters.platforms', defaultMessage: 'Platforms:' },
  createYourFilter: { id: 'column.explore.filters.create_your_filter', defaultMessage: 'Create your filter' },
  resetFilter: { id: 'column.explore.filters.reset', defaultMessage: 'Reset Filters' },
  filterByWords: { id: 'column.explore.filters.filter_by_words', defaultMessage: 'Filter by this/these words' },
  negative: { id: 'column.explore.filters.invert', defaultMessage: 'Invert' },
  nostr: { id: 'column.explore.filters.nostr', defaultMessage: 'Nostr' },
  atproto: { id: 'column.explore.filters.bluesky', defaultMessage: 'Bluesky' },
  activitypub: { id: 'column.explore.filters.fediverse', defaultMessage: 'Fediverse' },
  cancel: { id: 'column.explore.filters.cancel', defaultMessage: 'Cancel' },
  addFilter: { id: 'column.explore.filters.add_filter', defaultMessage: 'Add Filter' },
  all: { id: 'column.explore.media_filters.all', defaultMessage: 'All' },
  imageOnly: { id: 'column.explore.media_filters.image', defaultMessage: 'Image only' },
  videoOnly: { id: 'column.explore.media_filters.video', defaultMessage: 'Video only' },
  none: { id: 'column.explore.media_filters.none', defaultMessage: 'No media' },
  clearSearch: { id: 'column.explore.filters.clear_input', defaultMessage: 'Clear filter input' },
  removeFilter: { id: 'column.explore.filters.remove_filter', defaultMessage: 'Remove filter: {name}' },
  empty: { id: 'column.explore.filters.empty', defaultMessage: 'Hey there... You forget to write the filter!' },
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

const ProtocolCheckBox: React.FC<{ protocol: 'nostr' | 'atproto' | 'activitypub' }> = ({ protocol }) => {
  const intl = useIntl();
  const { tokens, addToken, removeToken } = useSearchTokens();

  const token = `-protocol:${protocol}`;
  const checked = !tokens.has(token);
  const message = messages[protocol];

  const handleProtocolFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked, name } = e.target;

    const token = `-protocol:${name}`;

    if (checked) {
      removeToken(token);
    } else {
      addToken(token);
    }
  };

  return (
    <HStack alignItems='center' space={2}>
      <Checkbox
        name={protocol}
        checked={checked}
        onChange={handleProtocolFilter}
        aria-label={intl.formatMessage(message)}
      />
      <Text size='md'>
        {intl.formatMessage(message)}
      </Text>
    </HStack>
  );
};

const PlatformFilters = () => {
  const intl = useIntl();

  return (
    <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
      <Text size='md' weight='bold'>
        {intl.formatMessage(messages.platforms)}
      </Text>

      <ProtocolCheckBox protocol='nostr' />
      <ProtocolCheckBox protocol='atproto' />
      <ProtocolCheckBox protocol='activitypub' />
    </HStack>
  );

};

const WordFilter = () => {
  const intl = useIntl();
  const { addToken, clearTokens } = useSearchTokens();

  const [word, setWord] = useState('');
  const [negative, setNegative] = useState(false);
  const hasValue = !!word;

  const handleReset = () => {
    clearTokens();
  };

  const handleClearValue = () => {
    setWord('');
  };

  const handleAddFilter = () => {
    if (word) {
      addToken(`${negative ? '-' : ''}${word}`);
      handleClearValue();
    } else {
      toast.error(intl.formatMessage(messages.empty));
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;

    switch (key) {
      case 'Enter':
        e.stopPropagation();
        e.preventDefault();
        handleAddFilter();
        break;
      case 'Escape':
        e.stopPropagation();
        e.preventDefault();
        handleClearValue();
        break;
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWord(e.target.value);
  };

  return (
    <Stack space={3}>
      <HStack justifyContent='between' alignItems='center'>
        <Text size='md' weight='bold'>
          {intl.formatMessage(messages.createYourFilter)}
        </Text>

        <IconButton src={refreshIcon} iconClassName='w-4' className='px-4' text={intl.formatMessage(messages.resetFilter)} theme='secondary' onClick={handleReset} />
      </HStack>

      <Stack space={2}>
        <Text size='md'>
          {intl.formatMessage(messages.filterByWords)}
        </Text>

        <HStack space={6}>
          <div className='relative w-full items-center p-0.5'>
            <Input theme='search' value={word} className='h-9' onChange={handleOnChange} onKeyDown={onKeyDown} />
            <div
              tabIndex={0}
              role='button'
              className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
            >
              <SvgIcon
                src={searchIcon}
                className={clsx('size-4 text-gray-600', { hidden: hasValue })}
              />

              <SvgIcon
                src={xIcon}
                onClick={() => setWord('')}
                aria-label={intl.formatMessage(messages.clearSearch)}
                className={clsx('size-4 text-gray-600', { hidden: !hasValue })}
              />
            </div>
          </div>

          {/* Include */}
          <HStack alignItems='center' space={2}>
            <Checkbox
              name='negative'
              checked={negative}
              onChange={() => setNegative(!negative)}
            />
            <Text size='md'>
              {intl.formatMessage(messages.negative)}
            </Text>
          </HStack>
        </HStack>
      </Stack>

      <HStack className='w-full p-0.5' space={2}>
        <Button
          className='w-1/2' theme='muted' onClick={handleClearValue}
        >
          {intl.formatMessage(messages.cancel)}
        </Button>

        <Button className='w-1/2' theme='secondary' onClick={handleAddFilter}>
          {intl.formatMessage(messages.addFilter)}
        </Button>
      </HStack>

    </Stack>
  );

};

const MediaFilter = () => {
  const intl = useIntl();
  const { tokens, addTokens, removeTokens } = useSearchTokens();

  const mediaFilters = {
    all: {
      tokens: [],
      label: intl.formatMessage(messages.all),
    },
    image: {
      tokens: ['media:true', '-video:true'],
      label: intl.formatMessage(messages.imageOnly),
    },
    video: {
      tokens: ['video:true'],
      label: intl.formatMessage(messages.videoOnly),
    },
    none: {
      tokens: ['-media:true'],
      label: intl.formatMessage(messages.none),
    },
  };

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const filter = e.target.value as keyof typeof mediaFilters;
    removeTokens(['media:true', '-video:true', 'video:true', '-media:true']);
    addTokens(mediaFilters[filter].tokens);
  };

  // FIXME: The `items` prop of `SelectDropdown` should become an array of objects.
  const items = Object
    .entries(mediaFilters)
    .reduce((acc, [key, value]) => {
      acc[key] = value.label;
      return acc;
    }, {} as Record<string, string>);

  const currentFilter = Object
    .entries(mediaFilters)
    .find(([, f]) => f.tokens.every(token => tokens.has(token)))?.[0] || 'all';

  return (
    <HStack alignItems='center' space={2}>
      <Text size='md' weight='bold'>
        {intl.formatMessage(messages.media)}
      </Text>

      <SelectDropdown
        className='max-w-[130px]'
        items={items}
        defaultValue={currentFilter}
        onChange={handleSelectChange}
      />
    </HStack>
  );

};

const LanguageFilter = () => {
  const intl = useIntl();
  const { tokens, addToken, removeToken } = useSearchTokens();

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const language = e.target.value;

    for (const token in tokens) {
      if (token.startsWith('language:')) {
        removeToken(token);
      }
    }

    addToken(`language:${language}`);
  };

  const token = [...tokens].find((token) => token.startsWith('language:'));
  const [, language = 'default'] = token?.split(':') ?? [];

  return (
    <HStack alignItems='center' space={2}>
      <Text size='md' weight='bold'>
        {intl.formatMessage(messages.language)}
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
        {intl.formatMessage(messages.showReplies)}
      </Text>
      <Toggle
        checked={!tokens.has('reply:false')}
        onChange={handleToggle}
      />
    </HStack>
  );
};

export { WordFilter, PlatformFilters, MediaFilter, LanguageFilter, ToggleRepliesFilter };