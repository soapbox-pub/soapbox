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
import { IGenerateFilter } from 'soapbox/features/explorer/components/explorerFilter.tsx';
import { SelectDropdown } from 'soapbox/features/forms/index.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { changeStatus, changeLanguage, changeMedia, createFilter, removeFilter, selectProtocol, resetFilters } from 'soapbox/reducers/search-filter.ts';
import { AppDispatch, RootState } from 'soapbox/store.ts';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  noReplies: { id: 'column.explorer.filters.no_replies', defaultMessage: 'No Replies:' },
  media: { id: 'column.explorer.filters.media', defaultMessage: 'Media:' },
  language: { id: 'column.explorer.filters.language', defaultMessage: 'Language:' },
  platforms: { id: 'column.explorer.filters.platforms', defaultMessage: 'Platforms:' },
  createYourFilter: { id: 'column.explorer.filters.create_your_filter', defaultMessage: 'Create your filter' },
  resetFilter: { id: 'column.explorer.filters.reset', defaultMessage: 'Reset Filters' },
  filterByWords: { id: 'column.explorer.filters.filter_by_words', defaultMessage: 'Filter by this/these words' },
  include: { id: 'column.explorer.filters.include', defaultMessage: 'Include' },
  exclude: { id: 'column.explorer.filters.exclude', defaultMessage: 'Exclude' },
  nostr: { id: 'column.explorer.filters.nostr', defaultMessage: 'Nostr' },
  bluesky: { id: 'column.explorer.filters.bluesky', defaultMessage: 'Bluesky' },
  fediverse: { id: 'column.explorer.filters.fediverse', defaultMessage: 'Fediverse' },
  cancel: { id: 'column.explorer.filters.cancel', defaultMessage: 'Cancel' },
  addFilter: { id: 'column.explorer.filters.add_filter', defaultMessage: 'Add Filter' },
  all: { id: 'column.explorer.media_filters.all', defaultMessage: 'All' },
  imageOnly: { id: 'column.explorer.media_filters.image', defaultMessage: 'Image only' },
  videoOnly: { id: 'column.explorer.media_filters.video', defaultMessage: 'Video only' },
  none: { id: 'column.explorer.media_filters.none', defaultMessage: 'No media' },
  clearSearch: { id: 'column.explorer.filters.clear_input', defaultMessage: 'Clear filter input' },
  removeFilter: { id: 'column.explorer.filters.remove_filter', defaultMessage: 'Remove filter: {name}' },
  empty: { id: 'column.explorer.filters.empty', defaultMessage: 'Hey there... You forget to write the filter!' },
});

const languages = {
  default: 'Global',
  en: 'English',
  ar: 'العربية',
  ast: 'Asturianu',
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
    const protocol = e.target.name.toLowerCase();

    dispatch(selectProtocol(protocol));
  };

  const CheckBox = ({ protocolN } : { protocolN: string }) => {
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
      <CheckBox protocolN={'nostr'} />

      {/* Bluesky */}
      <CheckBox protocolN={'bluesky'} />

      {/* Fediverse */}
      <CheckBox protocolN={'fediverse'} />

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
    localStorage.removeItem('soapbox:explorer:filters');
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
  }, [filters, mediaFilters]);

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
  const languageFilter = useAppSelector((state) => state.search_filter)[0];

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
        key={languageFilter?.name}
        className='max-w-[130px]'
        items={languages}
        defaultValue={languageFilter.name.toLowerCase()}
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
    dispatch(changeStatus({ type: 'no replies', status: !checked }));
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

const generateFilter = (dispatch: AppDispatch, intl: IntlShape, { name, status }: IGenerateFilter) => {
  const nameLowCase = name.toLowerCase();

  let borderColor = '';
  let textColor = '';

  if (Object.keys(languages).some((lang) => lang.toLowerCase() === nameLowCase)) {
    borderColor = 'border-gray-500';
    textColor = 'text-gray-500';
  } else {
    switch (nameLowCase) {
      case 'no replies':
      case 'image only':
      case 'video only':
      case 'no media':
        borderColor = 'border-gray-500';
        textColor = 'text-gray-500';
        break;
      case 'nostr':
        borderColor = 'border-purple-500';
        textColor = 'text-purple-500';
        break;
      case 'bluesky':
        borderColor = 'border-blue-500';
        textColor = 'text-blue-500';
        break;
      case 'fediverse':
        borderColor = 'border-indigo-500';
        textColor = 'text-indigo-500';
        break;
      default:
        borderColor = status ? 'border-green-500' : 'border-red-500';
        textColor = status ? 'text-green-500' : 'text-red-500';
    }
  }

  const handleChangeFilters = () => {
    if (['nostr', 'bluesky', 'fediverse'].includes(nameLowCase)) {
      dispatch(selectProtocol(nameLowCase));
    } else if (Object.keys(languages).some((lang) => lang.toLowerCase() === nameLowCase)) {
      dispatch(changeLanguage('default'));
    } else if (['no replies', 'image only', 'video only', 'no media'].includes(nameLowCase)) {
      dispatch(changeStatus({ type: nameLowCase, status: false }));
    } else {
      dispatch(removeFilter(nameLowCase));
    }
  };

  return (
    <div
      key={name}
      className={`group m-1 flex items-center whitespace-normal break-words rounded-full border-2 bg-transparent px-3 pr-1 text-base font-medium shadow-sm hover:cursor-pointer ${borderColor} ${textColor} `}
    >
      {name.toLowerCase() !== 'default' ? name : <FormattedMessage id='column.explorer.filters.language.default' defaultMessage='Global' />}
      <IconButton
        iconClassName='!w-4' className={` !py-0 group-hover:block ${textColor}`} src={xIcon}
        onClick={handleChangeFilters}
        aria-label={intl.formatMessage(messages.removeFilter, { name })}
      />
    </div>
  );
};

export { CreateFilter, PlatformFilters, MediaFilter, LanguageFilter, ToggleRepliesFilter, generateFilter };