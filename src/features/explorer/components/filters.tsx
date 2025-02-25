import searchIcon from '@tabler/icons/outline/search.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import { useState } from 'react';
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
import { IGenerateFilter } from 'soapbox/features/explorer/components/explorerFilter.tsx';
import { SelectDropdown } from 'soapbox/features/forms/index.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { changeLanguage, createFilter, handleToggle, removeFilter, selectProtocol } from 'soapbox/reducers/search-filter.ts';
import { AppDispatch, RootState } from 'soapbox/store.ts';
import toast from 'soapbox/toast.tsx';

const messages = defineMessages({
  showReplies: { id: 'column.explorer.filters.show_replies', defaultMessage: 'Show replies:' },
  showMedia: { id: 'column.explorer.filters.show_text_posts', defaultMessage: 'Just text posts:' },
  showVideo: { id: 'column.explorer.filters.show_video_posts', defaultMessage: 'Just posts with video:' },
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
    const protocol = e.target.name;

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
        <Text size='lg'>
          {intl.formatMessage(message)}
        </Text>
      </HStack>
    );
  };

  return (
    <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
      <Text size='lg' weight='bold'>
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

  const handleAddFilter = () => {
    if (inputValue.length > 0) {
      dispatch(createFilter({ name: inputValue, status: include }));
    } else {
      toast.error('Hey there... you forget to write the filter!');
    }
  };

  return (
    <Stack space={3}>
      <Text size='lg' weight='bold'>
        {intl.formatMessage(messages.createYourFilter)}
      </Text>

      <Stack>
        <Text size='lg'>
          {intl.formatMessage(messages.filterByWords)}
        </Text>

        <HStack space={6}>


          <div className='relative w-full items-center'>
            <Input theme='search' value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            <div
              role='button'
              tabIndex={0}
              className='absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 rtl:left-0 rtl:right-auto'
            >
              <SvgIcon
                src={searchIcon}
                className={clsx('size-4 text-gray-600', { hidden: hasValue })}
              />

              <SvgIcon
                src={xIcon}
                onClick={() => setInputValue('')}
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
                setInclude(true);
              }}
            />
            <Text size='lg'>
              {intl.formatMessage(messages.include)}
            </Text>
          </HStack>

          {/* Exclude */}
          <HStack alignItems='center' space={2}>
            <Checkbox
              name='exclude'
              checked={!include}
              onChange={() => {
                setInclude(false);
              }}
            />
            <Text size='lg'>
              {intl.formatMessage(messages.exclude)}
            </Text>
          </HStack>
        </HStack>
      </Stack>

      <HStack className='w-full p-0.5' space={2}>
        <Button
          className='w-1/2' theme='secondary' onClick={() => {
            setInclude(false);
            setInputValue('');
          }
          }
        >
          {intl.formatMessage(messages.cancel)}
        </Button>

        <Button className='w-1/2' theme='primary' onClick={handleAddFilter}>
          {intl.formatMessage(messages.addFilter)}
        </Button>
      </HStack>

    </Stack>
  );

};

const LanguageFilter = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const language = e.target.value;
    dispatch(changeLanguage(language));
  };

  return (
    <HStack alignItems='center' space={2}>
      <Text size='lg' weight='bold'>
        {intl.formatMessage(messages.language)}
      </Text>

      <SelectDropdown
        className='max-w-[200px]'
        items={languages}
        defaultValue={languages.default}
        onChange={handleSelectChange}
      />
    </HStack>
  );

};

const ToggleFilter = ({ type }: {type: 'reply' | 'media' | 'video'}) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const filterType = type.toLowerCase();
  let label;

  switch (type) {
    case 'reply':
      label = intl.formatMessage(messages.showReplies);
      break;
    case 'media':
      label = intl.formatMessage(messages.showMedia);
      break;
    default:
      label = intl.formatMessage(messages.showVideo);
  }

  const filters = useAppSelector((state) => state.search_filter);
  const repliesFilter = filters.find((filter) => filter.name.toLowerCase() === filterType);
  const checked = repliesFilter?.status;

  const handleToggleComponent = () => {
    dispatch(handleToggle({ type: filterType, checked: !checked }));
  };

  return (
    <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
      <Text size='lg' weight='bold'>
        {label}
      </Text>
      <Toggle
        checked={checked}
        onChange={handleToggleComponent}
      />
    </HStack>
  );
};

const generateFilter = (dispatch: AppDispatch, { name, status }: IGenerateFilter) => {
  let borderColor = '';
  let textColor = '';
  let hasButton = false;
  const nameLowCase = name.toLowerCase();

  const handleChangeFilters = () => {
    dispatch(removeFilter(name));
  };

  if (Object.keys(languages).some((lang) => lang.toLowerCase() === nameLowCase)) {
    borderColor = 'border-gray-500';
    textColor = 'text-gray-500';
  } else {
    switch (nameLowCase) {
      case 'reply':
      case 'media':
      case 'video':
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
        hasButton = true;
    }
  }

  return (
    <div
      key={name}
      className={`group m-1 flex items-center gap-0.5 whitespace-normal break-words rounded-full border-2 bg-transparent px-3 text-base font-medium shadow-sm hover:cursor-pointer ${hasButton ? 'hover:pr-1' : '' } ${borderColor} ${textColor} `}
    >
      {name}
      {hasButton && <IconButton
        iconClassName='!w-4' className={`hidden !p-0 px-1 group-hover:block ${textColor}`} src={xIcon}
        onClick={handleChangeFilters}

      />}
    </div>
  );
};

export { CreateFilter, PlatformFilters, LanguageFilter, ToggleFilter, generateFilter };