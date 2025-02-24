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
import { SelectDropdown } from 'soapbox/features/forms/index.tsx';
import { IGenerateFilter } from 'soapbox/features/search/components/explorerFilter.tsx';

const messages = defineMessages({
  filters: { id: 'column.explorer.filters', defaultMessage: 'Filters:' },
  showReplies: { id: 'column.explorer.filters.show_replies', defaultMessage: 'Show replies:' },
  showMedia: { id: 'column.explorer.filters.show_text_posts', defaultMessage: 'Just text posts:' },
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

interface IFilter {
  onChangeFilters: React.Dispatch<React.SetStateAction<IGenerateFilter[]>>;
}

interface IPlatformFilters {
  filters: IGenerateFilter[];
  onChangeFilters: React.Dispatch<React.SetStateAction<IGenerateFilter[]>>;
}

const PlatformFilters = ({ onChangeFilters, filters }: IPlatformFilters) => {
  const intl = useIntl();

  const toggleProtocolFilter = (protocolName: string, protocolValue: string) => {
    onChangeFilters(prevFilters => {

      const exists = prevFilters.some(tag => tag.name.toLowerCase() === protocolName.toLowerCase() && tag.value[0] !== '-');
      const newFilterList = prevFilters.filter(tag => tag.name.toLowerCase() !== protocolName.toLowerCase());

      const newFilter = {
        name: protocolName,
        state: null,
        value: exists ? `-protocol:${protocolValue}` : `protocol:${protocolValue}`,
      };

      if (newFilterList.length === 0) {
        return [newFilter];
      }

      return [newFilterList[0], newFilter, ...newFilterList.slice(1)];
    });
  };

  return (
    <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
      <Text size='lg' weight='bold'>
        {intl.formatMessage(messages.platforms)}
      </Text>

      {/* Nostr */}
      <HStack alignItems='center' space={2}>
        <Checkbox
          name='nostr'
          checked={filters.some(tag => tag.name.toLowerCase() === 'nostr' && tag.value[0] !== '-')}
          onChange={() => toggleProtocolFilter('Nostr', 'nostr')}
        />
        <Text size='lg'>
          {intl.formatMessage(messages.nostr)}
        </Text>
      </HStack>

      {/* Bluesky */}
      <HStack alignItems='center' space={2}>
        <Checkbox
          name='bluesky'
          checked={filters.some(tag => tag.name.toLowerCase() === 'bluesky' && tag.value[0] !== '-')}
          onChange={() => toggleProtocolFilter('Bluesky', 'atproto')}
        />
        <Text size='lg'>
          {intl.formatMessage(messages.bluesky)}
        </Text>
      </HStack>

      {/* Fediverse */}
      <HStack alignItems='center' space={2}>
        <Checkbox
          name='fediverse'
          checked={filters.some(tag => tag.name.toLowerCase() === 'fediverse' && tag.value[0] !== '-')}
          onChange={() => toggleProtocolFilter('Fediverse', 'activitypub')}
        />
        <Text size='lg'>
          {intl.formatMessage(messages.fediverse)}
        </Text>
      </HStack>

    </HStack>
  );

};

const CreateFilter = ({ onChangeFilters }: IFilter) => {
  const intl = useIntl();
  const [inputValue, setInputValue] = useState('');
  const [include, setInclude] = useState('');
  const hasValue = inputValue.length > 0;

  const handleAddFilter = () => {
    onChangeFilters((prev) => {
      return [...prev, { name: inputValue, state: include === '', value: `${include}${inputValue.split(' ').join(` ${include}`)}` }];
    });
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
              checked={!(include.length > 0)}
              onChange={() => {
                setInclude('');
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
              checked={(include.length > 0)}
              onChange={() => {
                setInclude('-');
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
            setInclude('');
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

const LanguageFilter = ({ onChangeFilters }: IFilter) => {
  const intl = useIntl();

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const value = e.target.value;

    if (value.toLowerCase() === 'default') {
      onChangeFilters((prevValue) => prevValue.filter((value) => !value.value.includes('language:')));
    } else {
      onChangeFilters((prevValue) => {
        return [{ name: value.toUpperCase(), state: null, value: `language:${value}` }, ...prevValue.filter((value) => !value.value.includes('language:'))];
      });
    }
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

const RepliesFilter = ({ onChangeFilters }: IFilter) => {
  const intl = useIntl();
  const [showReplies, setShowReplies] = useState(false);

  const handleToggleReplies: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setShowReplies(!showReplies);
    const isOn = e.target.checked;

    if (isOn) {
      onChangeFilters((prevValue) => [...prevValue.filter((prev) => prev.name.toLowerCase() !== 'reply'), { name: 'Reply', state: null, value: 'reply:true' }]);
    } else {
      onChangeFilters((prevValue) => [...prevValue.filter((prev) => prev.name.toLowerCase() !== 'reply')]);
    }
  };

  return (
    <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
      <Text size='lg' weight='bold'>
        {intl.formatMessage(messages.showReplies)}
      </Text>
      <Toggle
        checked={showReplies}
        onChange={handleToggleReplies}
      />
    </HStack>
  );

};

const MediaFilter = ({ onChangeFilters }: IFilter) => {
  const intl = useIntl();
  const [showMedia, setShowMedia] = useState(false);

  const handleToggleReplies: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setShowMedia(!showMedia);
    const isOn = e.target.checked;

    if (isOn) {
      onChangeFilters((prevValue) => [...prevValue.filter((prev) => prev.name.toLowerCase() !== 'text'), { name: 'Text', state: null, value: 'media:false' }]);
    } else {
      onChangeFilters((prevValue) => [...prevValue.filter((prev) => prev.name.toLowerCase() !== 'text')]);
    }
  };

  return (
    <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
      <Text size='lg' weight='bold'>
        {intl.formatMessage(messages.showMedia)}
      </Text>
      <Toggle
        checked={showMedia}
        onChange={handleToggleReplies}
      />
    </HStack>
  );

};

const generateFilter = ({ name, state }: IGenerateFilter, onChangeFilters: React.Dispatch<React.SetStateAction<IGenerateFilter[]>>) => {
  let borderColor = '';
  let textColor = '';
  let hasButton = false;
  switch (name.toLowerCase()) {
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
      if (name.toLowerCase() === 'reply' || name.toLowerCase() === 'text' || Object.keys(languages).some((lang) => lang === name.toLowerCase())) {
        borderColor = 'border-grey-500';
        textColor = 'text-grey-500';
        break;
      }
      borderColor = state ? 'border-green-500' : 'border-red-500';
      textColor = state ? 'text-green-500' : 'text-red-500';
      hasButton = true;
  }

  return (
    <div
      key={name}
      className={`group m-1 flex items-center gap-0.5 whitespace-normal break-words rounded-full border-2 bg-transparent px-3 text-base font-medium shadow-sm hover:cursor-pointer ${hasButton ? 'hover:pr-1' : '' } ${borderColor} `}
    >
      {name}
      {hasButton && <IconButton
        iconClassName='!w-4' className={`hidden !p-0 px-1 group-hover:block ${textColor}`} src={xIcon} onClick={() => onChangeFilters((prevValue) => {
          return prevValue.filter((x) => x.name !== name);
        })}
      />}
    </div>
  );
};

export { CreateFilter, PlatformFilters, LanguageFilter, RepliesFilter, MediaFilter, generateFilter };