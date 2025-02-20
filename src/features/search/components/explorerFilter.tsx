import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import searchIcon from '@tabler/icons/outline/search.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSearch, submitSearch } from 'soapbox/actions/search.ts';
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
  state: boolean | null;
  value: string;
}

const ExplorerFilter = () => {
  const dispatch = useAppDispatch();
  const [showReplies, setShowReplies] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [include, setInclude] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const hasValue = inputValue.length > 0;

  const intl = useIntl();

  const [tagFilters, setTagFilters] = useState<IGenerateFilter[]>([
    { 'name': 'Nostr', state: null, 'value': 'protocol:nostr' },
    { 'name': 'Bluesky', state: null, 'value': 'protocol:atproto' },
    { 'name': 'Fediverse', state: null, 'value': 'protocol:activitypub' },
  ]);

  const handleToggleReplies: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setShowReplies(!showReplies);
    const isOn = e.target.checked;

    if (isOn) {
      setTagFilters((prevValue) => [...prevValue.filter((prev) => prev.name.toLowerCase() !== 'reply'), { name: 'Reply', state: null, value: 'reply:true' }]);
    } else {
      setTagFilters((prevValue) => [...prevValue.filter((prev) => prev.name.toLowerCase() !== 'reply')]);
    }
  };

  const toggleProtocolFilter = (protocolName: string, protocolValue: string) => {
    setTagFilters(prevFilters => {

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

  const generateFilter = ({ name, state }: IGenerateFilter) => {
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
        if (name.toLowerCase() === 'reply' || Object.keys(languages).some((lang) => lang === name.toLowerCase())) {
          borderColor = 'border-grey-500';
          textColor = 'text-grey-500';
          break;
        }
        borderColor = state ? 'border-green-500' : 'border-red-500';
        textColor = state ? 'text-green-500' : 'text-red-500';
    }

    return (
      <div
        key={name}
        className={`group m-1 flex items-center gap-0.5 whitespace-normal break-words rounded-full border-2 bg-transparent px-3 text-base font-medium shadow-sm hover:cursor-pointer hover:pr-1 ${borderColor} `}
      >
        {name}
        <IconButton
          iconClassName='!w-4' className={`hidden !p-0 px-1 group-hover:block ${textColor}`} src={xIcon} onClick={() => setTagFilters((prevValue) => {
            return prevValue.filter((x) => x.name !== name);
          })}
        />
      </div>
    );
  };

  const handleSelectChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    const value = e.target.value;

    if (value.toLowerCase() === 'default') {
      setTagFilters((prevValue) => prevValue.filter((value) => !value.value.includes('language:')));
    } else {
      setTagFilters((prevValue) => {
        return [{ name: value.toUpperCase(), state: null, value: `language:${value}` }, ...prevValue.filter((value) => !value.value.includes('language:'))];
      });
    }
  };

  const handleAddFilter = () => {
    setTagFilters((prev) => {
      return [...prev, { name: inputValue, state: include === '', value: `${include}${inputValue.split(' ').join(` ${include}`)}` }];
    });
  };

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

          {tagFilters.length > 0 && [...tagFilters.slice(0, 3).filter((x)=> x.value[0] !== '-' && x.state === null).map(generateFilter), ...tagFilters.slice(3).map(generateFilter)]}

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
        <HStack className='flex-wrap whitespace-normal' alignItems='center' space={2}>
          <Text size='lg' weight='bold'>
            {intl.formatMessage(messages.showReplies)}
          </Text>

          <Toggle
            checked={showReplies}
            onChange={handleToggleReplies}
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
            defaultValue={languages.default}
            onChange={handleSelectChange}
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
              checked={tagFilters.some(tag => tag.name.toLowerCase() === 'nostr' && tag.value[0] !== '-')}
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
              checked={tagFilters.some(tag => tag.name.toLowerCase() === 'bluesky' && tag.value[0] !== '-')}
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
              checked={tagFilters.some(tag => tag.name.toLowerCase() === 'fediverse' && tag.value[0] !== '-')}
              onChange={() => toggleProtocolFilter('Fediverse', 'activitypub')}
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
      </Stack>

    </Stack>
  );
};


export default ExplorerFilter;