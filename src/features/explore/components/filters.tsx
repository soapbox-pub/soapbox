import refreshIcon from '@tabler/icons/outline/refresh.svg';
import searchIcon from '@tabler/icons/outline/search.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import React, { useEffect, useMemo, useState } from 'react';
import { FormattedMessage, IntlShape, defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import Checkbox from 'soapbox/components/ui/checkbox.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Toggle from 'soapbox/components/ui/toggle.tsx';
import { IGenerateFilter } from 'soapbox/features/explore/components/exploreFilter.tsx';
import { SelectDropdown } from 'soapbox/features/forms/index.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { changeStatus, changeLanguage, changeMedia, createFilter, removeFilter, selectProtocol, resetFilters } from 'soapbox/reducers/search-filter.ts';
import { AppDispatch, RootState } from 'soapbox/store.ts';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  noReplies: { id: 'column.explore.filters.no_replies', defaultMessage: 'No Replies:' },
  media: { id: 'column.explore.filters.media', defaultMessage: 'Media:' },
  language: { id: 'column.explore.filters.language', defaultMessage: 'Language:' },
  platforms: { id: 'column.explore.filters.platforms', defaultMessage: 'Platforms:' },
  platformsError: { id: 'column.explore.filters.platforms.error', defaultMessage: 'Protocol not found for: {name}' },
  atLeast: { id: 'column.explore.filters.atLeast', defaultMessage: 'At least one platform must remain selected.' },
  createYourFilter: { id: 'column.explore.filters.create_your_filter', defaultMessage: 'Create your filter' },
  resetFilter: { id: 'column.explore.filters.reset', defaultMessage: 'Reset Filters' },
  filterByWords: { id: 'column.explore.filters.filter_by_words', defaultMessage: 'Filter by this/these words' },
  include: { id: 'column.explore.filters.include', defaultMessage: 'Include' },
  exclude: { id: 'column.explore.filters.exclude', defaultMessage: 'Exclude' },
  nostr: { id: 'column.explore.filters.nostr', defaultMessage: 'Nostr' },
  bluesky: { id: 'column.explore.filters.bluesky', defaultMessage: 'Bluesky' },
  fediverse: { id: 'column.explore.filters.fediverse', defaultMessage: 'Fediverse' },
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

const PlatformFilters = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const filterList = useAppSelector((state: RootState) => state.search_filter);

  const handleProtocolFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    const matchingFilter = filterList.slice(1, 4).find(
      (filter) => filter.name.toLowerCase() === e.target.name.toLowerCase(),
    );

    const protocol = matchingFilter?.value;
    const isLastChecked = filterList.slice(1, 4).filter((filter) => filter.status).length === 1;

    if (!isChecked && isLastChecked) {
      toast.error(messages.atLeast);
      return;
    }

    if (!protocol) {
      console.error(intl.formatMessage(messages.platformsError, { name: e.target.name }));
      return;
    }

    dispatch(selectProtocol(protocol));
  };

  const CustomCheckBox = ({ protocolN } : { protocolN: string }) => {
    const filter = filterList.find((filter) => filter.name.toLowerCase() === protocolN);
    const checked = filter?.status;
    let message;

    switch (protocolN) {
      case 'nostr':
        message = messages.nostr;
        break;
      case 'bluesky':
        message = messages.bluesky;
        break;
      default:
        message = messages.fediverse;
    }

    return (
      <HStack alignItems='center' space={2}>
        <Checkbox
          name={protocolN}
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

  return (
    <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
      <Text size='md' weight='bold'>
        {intl.formatMessage(messages.platforms)}
      </Text>

      {/* Nostr */}
      <CustomCheckBox protocolN='nostr' />

      {/* Bluesky */}
      <CustomCheckBox protocolN='bluesky' />

      {/* Fediverse */}
      <CustomCheckBox protocolN='fediverse' />

    </HStack>
  );

};

const CreateFilter = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [inputValue, setInputValue] = useState('');
  const [include, setInclude] = useState(true);
  const hasValue = inputValue.length > 0;

  const handleReset = () => {
    dispatch(resetFilters());
    localStorage.removeItem('soapbox:explore:filters');
  };

  const handleClearValue = () => {
    setInputValue('');
  };

  const handleAddFilter = () => {
    if (inputValue.length > 0) {
      dispatch(createFilter({ name: inputValue, status: include }));
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
    setInputValue(e.target.value);
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
            <Input theme='search' value={inputValue} className='h-9' onChange={handleOnChange} onKeyDown={onKeyDown} />
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
                onClick={() => setInputValue('')}
                aria-label={intl.formatMessage(messages.clearSearch)}
                className={clsx('size-4 text-gray-600', { hidden: !hasValue })}
              />
            </div>

          </div>

          {/* Include */}
          <HStack alignItems='center' space={2}>
            <Checkbox
              name='include'
              checked={include}
              onChange={() => {
                if (!include) {
                  setInclude(true);
                }
              }}
            />
            <Text size='md'>
              {intl.formatMessage(messages.include)}
            </Text>
          </HStack>

          {/* Exclude */}
          <HStack alignItems='center' space={2}>
            <Checkbox
              name='exclude'
              checked={!include}
              onChange={() => {
                if (include) {
                  setInclude(false);
                }
              }}
            />
            <Text size='md'>
              {intl.formatMessage(messages.exclude)}
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
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.search_filter.filter(filter => ['all', 'image only', 'video only', 'no media'].includes(filter.name.toLowerCase())));


  const mediaFilters = useMemo(() => ({
    all: intl.formatMessage(messages.all),
    image: intl.formatMessage(messages.imageOnly),
    video: intl.formatMessage(messages.videoOnly),
    none: intl.formatMessage(messages.none),
  }), [intl]);

  const [selectedMedia, setSelectedMedia] = useState<string>(mediaFilters.all);

  useEffect(() => {
    const newMediaValue = (Object.keys(mediaFilters) as Array<keyof typeof mediaFilters>)
      .find((key) => mediaFilters[key] === filters.find((filter) => filter.status === true)?.name)
      || mediaFilters.all;

    setSelectedMedia(newMediaValue);
  }, [mediaFilters]);

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const filter = e.target.value;
    dispatch(changeMedia(filter));
  };

  return (
    <HStack alignItems='center' space={2}>
      <Text size='md' weight='bold'>
        {intl.formatMessage(messages.media)}
      </Text>

      <SelectDropdown
        key={selectedMedia}
        className='max-w-[130px]'
        items={mediaFilters}
        defaultValue={selectedMedia}
        onChange={handleSelectChange}
      />
    </HStack>
  );

};

const LanguageFilter = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const filter = useAppSelector((state) => state.search_filter)[0];

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const language = e.target.value;
    dispatch(changeLanguage(language));
  };

  return (
    <HStack alignItems='center' space={2}>
      <Text size='md' weight='bold'>
        {intl.formatMessage(messages.language)}
      </Text>

      <SelectDropdown
        key={filter?.value}
        className='max-w-[130px]'
        items={languages}
        defaultValue={filter.name.toLowerCase()}
        onChange={handleSelectChange}
      />
    </HStack>
  );

};

const ToggleRepliesFilter = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const label = intl.formatMessage(messages.noReplies);

  const filters = useAppSelector((state) => state.search_filter);
  const repliesFilter = filters.find((filter) => filter.value.toLowerCase().includes('reply'));
  const checked = repliesFilter?.status;

  const handleToggle = () => {
    dispatch(changeStatus({ value: 'reply:false', status: !checked }));
  };

  return (
    <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
      <Text size='md' weight='bold'>
        {label}
      </Text>
      <Toggle
        checked={checked}
        onChange={handleToggle}
      />
    </HStack>
  );
};

const generateFilter = (dispatch: AppDispatch, intl: IntlShape, { name, value, status }: IGenerateFilter) => {
  let borderColor = '';
  let textColor = '';

  if (Object.keys(languages).some((lang) => value.includes('language:'))) {
    borderColor = 'border-gray-500';
    textColor = 'text-gray-500';
  } else {
    switch (value) {
      case 'reply:false':
      case 'media:true -video:true':
      case 'video:true':
      case '-media:true':
        borderColor = 'border-gray-500';
        textColor = 'text-gray-500';
        break;
      case 'protocol:nostr':
        borderColor = 'border-purple-500';
        textColor = 'text-purple-500';
        break;
      case 'protocol:atproto':
        borderColor = 'border-blue-500';
        textColor = 'text-blue-500';
        break;
      case 'protocol:activitypub':
        borderColor = 'border-indigo-500';
        textColor = 'text-indigo-500';
        break;
      default:
        borderColor = status ? 'border-green-500' : 'border-red-500';
        textColor = status ? 'text-green-500' : 'text-red-500';
    }
  }

  const handleChangeFilters = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (['protocol:nostr', 'protocol:atproto', 'protocol:activitypub'].includes(value)) {
      dispatch(selectProtocol(value));
    } else if (['reply:false', 'media:true -video:true', 'video:true', '-media:true'].includes(value)) {
      dispatch(changeStatus({ value: value, status: false }));
    } else if (value.includes('language:')) {
      dispatch(changeLanguage('default'));
    } else {
      dispatch(removeFilter(value));
    }
  };

  return (
    <div
      key={value}
      className={`group m-1 flex items-center whitespace-normal break-words rounded-full border-2 bg-transparent px-3 pr-1 text-base font-medium shadow-sm hover:cursor-pointer ${borderColor} ${textColor} `}
    >
      {name.toLowerCase() !== 'default' ? name : <FormattedMessage id='column.explore.filters.language.default' defaultMessage='Global' />}
      <IconButton
        iconClassName='!w-4' className={` !py-0 group-hover:block ${textColor}`} src={xIcon}
        onClick={handleChangeFilters}
        aria-label={intl.formatMessage(messages.removeFilter, { name })}
      />
    </div>
  );
};

export { CreateFilter, PlatformFilters, MediaFilter, LanguageFilter, ToggleRepliesFilter, generateFilter };