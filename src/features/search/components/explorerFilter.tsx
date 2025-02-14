import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import searchIcon from '@tabler/icons/outline/search.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import { useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import Checkbox from 'soapbox/components/ui/checkbox.tsx';
import Divider from 'soapbox/components/ui/divider.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import SvgIcon from 'soapbox/components/ui/svg-icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Toggle from 'soapbox/components/ui/toggle.tsx';
import { SelectDropdown } from 'soapbox/features/forms/index.tsx';

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
  applyFilter: { id: 'column.explorer.filters.apply_filter', defaultMessage: 'Apply Filter' },
});

const languages = {
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
  'en-Shaw': '𐑖𐑱𐑝𐑾𐑯',
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
  'pt-BR': 'Português do Brasil',
  ro: 'Română',
  ru: 'Русский',
  sk: 'Slovenčina',
  sl: 'Slovenščina',
  sq: 'Shqip',
  sr: 'Српски',
  'sr-Latn': 'Srpski (latinica)',
  sv: 'Svenska',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  th: 'ไทย',
  tr: 'Türkçe',
  uk: 'Українська',
  zh: '中文',
  'zh-CN': '简体中文',
  'zh-HK': '繁體中文（香港）',
  'zh-TW': '繁體中文（臺灣）',
};

interface IGenerateFilter {
  name: string;
  status: boolean | null;
}

const ExplorerFilter = () => {
  const [showReplies, setShowReplies] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [include, setInclude] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  const hasValue = inputValue.length > 0;

  const intl = useIntl();

  const [testList, setTestList] = useState([
    { 'name': 'EN', 'status': true },
    { 'name': 'Nostr', 'status': null },
    { 'name': 'Bluesky', 'status': null },
    { 'name': 'Fediverse', 'status': null },
    { 'name': 'Bitcoin', 'status': false },
    { 'name': 'NostrInArgentina', 'status': true },
    { 'name': 'ElonForPresident', 'status': false },
  ]);

  const generateFilter = ({ name, status }: IGenerateFilter) => {
    let borderColor = '';
    let textColor = '';
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
        borderColor = status ? 'border-green-500' : 'border-red-500';
        textColor = status ? 'text-green-500' : 'text-red-500';
    }

    return (
      <div
        key={name}
        className={`group m-1 flex items-center gap-0.5 whitespace-normal break-words rounded-full border-2 bg-transparent px-3 text-lg font-medium shadow-sm hover:cursor-pointer hover:pr-1 ${borderColor} `}
      >
        {name}
        <IconButton
          iconClassName='!w-4' className={`hidden !p-0 px-1 group-hover:block ${textColor}`} src={xIcon} onClick={() => setTestList((prevValue) => {
            return prevValue.filter((x) => x.name !== name);
          })}
        />
      </div>
    );
  };

  return (
    <Stack className='px-4' space={3}>

      {/* Filters */}
      <HStack alignItems='start' space={1}>
        <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
          <Text size='lg' weight='bold'>
            {intl.formatMessage(messages.filters)}
          </Text>

          {testList.map(generateFilter)}

        </HStack>
        <IconButton
          src={arrowIcon}
          theme='transparent'
          className={`transition-transform duration-300${ isOpen ? 'rotate-0' : 'rotate-180'}`}
          onClick={() => setIsOpen(!isOpen)}
        />
      </HStack>

      <Stack className={`overflow-hidden transition-all duration-500 ease-in-out  ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`} space={3}>

        {/* Show Reply toggle */}
        <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
          <Text size='lg' weight='bold'>
            {intl.formatMessage(messages.showReplies)}
          </Text>

          <Toggle
            checked={showReplies}
            onChange={() => setShowReplies(!showReplies)}
          />

        </HStack>

        {/* Language */}
        <HStack alignItems='center' space={2}>
          <Text size='lg' weight='bold'>
            {intl.formatMessage(messages.language)}
          </Text>

          <SelectDropdown
            className='max-w-[200px]'
            items={languages}
            defaultValue={languages.en}
          />
        </HStack>

        {/* Platforms */}
        <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
          <Text size='lg' weight='bold'>
            {intl.formatMessage(messages.platforms)}
          </Text>

          {/* Nostr */}
          <HStack alignItems='center' space={2}>
            <Checkbox
              name='nostr'
              checked={testList.some((tag)=> tag.name.toLowerCase() === 'nostr')}
              onChange={() => setTestList((prevValue) => {
                const exists = prevValue.some((x) => x.name.toLowerCase() === 'nostr');
                if (exists) {
                  return prevValue.filter((x) => x.name.toLowerCase() !== 'nostr');
                } else {
                  return [...prevValue, { name: 'Nostr', status: null }];
                }
              })}
              // checked={params.get('agreement', false)}
              // required
            />
            <Text size='lg'>
              {intl.formatMessage(messages.nostr)}
            </Text>
          </HStack>

          {/* Bluesky */}
          <HStack alignItems='center' space={2}>
            <Checkbox
              name='bluesky'
              checked={testList.some((tag)=> tag.name.toLowerCase() === 'bluesky')}
              onChange={() => setTestList((prevValue) => {
                const exists = prevValue.some((x) => x.name.toLowerCase() === 'bluesky');
                if (exists) {
                  return prevValue.filter((x) => x.name.toLowerCase() !== 'bluesky');
                } else {
                  return [...prevValue, { name: 'Bluesky', status: null }];
                }
              })}
            />
            <Text size='lg'>
              {intl.formatMessage(messages.bluesky)}
            </Text>
          </HStack>

          {/* Fediverse */}
          <HStack alignItems='center' space={2}>
            <Checkbox
              name='fediverse'
              checked={testList.some((tag)=> tag.name.toLowerCase() === 'fediverse')}
              onChange={() => setTestList((prevValue) => {
                const exists = prevValue.some((x) => x.name.toLowerCase() === 'fediverse');
                if (exists) {
                  return prevValue.filter((x) => x.name.toLowerCase() !== 'fediverse');
                } else {
                  return [...prevValue, { name: 'Fediverse', status: null }];
                }
              })}
            />
            <Text size='lg'>
              {intl.formatMessage(messages.fediverse)}
            </Text>
          </HStack>

        </HStack>

        <Divider />

        {/* Create your filter */}
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
                    className={clsx('size-4 text-gray-600', { hidden: !hasValue })}
                  />
                </div>

              </div>

              {/* Include */}
              <HStack alignItems='center' space={2}>
                <Checkbox
                  name='include'
                  checked={include}
                  onChange={() => setInclude(!include)}
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
                  onChange={() => setInclude(!include)}
                />
                <Text size='lg'>
                  {intl.formatMessage(messages.exclude)}
                </Text>
              </HStack>
            </HStack>
          </Stack>

          <HStack className='w-full' space={2}>
            <Button className='w-1/2' theme='secondary'>
              {intl.formatMessage(messages.cancel)}
            </Button>

            <Button className='w-1/2' theme='primary'>
              {intl.formatMessage(messages.applyFilter)}
            </Button>
          </HStack>

        </Stack>
      </Stack>

    </Stack>
  );
};


export default ExplorerFilter;