import arrowIcon from '@tabler/icons/outline/chevron-down.svg';
import { debounce } from 'es-toolkit';
import { useEffect, useMemo, useState } from 'react';
// import { useIntl } from 'react-intl';

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

interface IGenerateFilter {
  name: string;
  status: boolean | null;
  value: string;
}

const ExploreFilter = () => {
  // const intl = useIntl();
  const dispatch = useAppDispatch();
  const { tokens } = useSearchTokens();
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

  return (
    <Stack className='px-4' space={3}>

      {/* Filters */}
      <HStack alignItems='start' justifyContent='between' space={1}>
        <HStack className='flex-wrap whitespace-normal' alignItems='center'>
          {/* {tokens.size > 0 && [...filters.slice(0, 8).filter((value) => value.status).map((value) => generateFilter(dispatch, intl, value)), ...filters.slice(8).map((value) => generateFilter(dispatch, intl, value))]} */}

        </HStack>
        <IconButton
          src={arrowIcon}
          theme='transparent'
          className={`transition-transform duration-300 ${ isOpen ? 'rotate-180' : 'rotate-0'}`}
          onClick={handleClick}
        />
      </HStack>

      <Stack className={`overflow-hidden transition-all duration-500 ease-in-out  ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`} space={3}>

        {/* Show Reply toggle */}
        <ToggleRepliesFilter />

        {/* Media toggle */}
        <MediaFilter />

        {/* Language */}
        <LanguageFilter />

        {/* Platforms */}
        <PlatformFilters />

        <Divider />

        {/* Create your filter */}
        <WordFilter />

      </Stack>

    </Stack>
  );
};

// const generateFilter = (dispatch: AppDispatch, intl: IntlShape, { name, value, status }: IGenerateFilter) => {
//   let borderColor = '';
//   let textColor = '';

//   if (Object.keys(languages).some((lang) => value.includes('language:'))) {
//     borderColor = 'border-gray-500';
//     textColor = 'text-gray-500';
//   } else {
//     switch (value) {
//       case 'reply:false':
//       case 'media:true -video:true':
//       case 'video:true':
//       case '-media:true':
//         borderColor = 'border-gray-500';
//         textColor = 'text-gray-500';
//         break;
//       case 'protocol:nostr':
//         borderColor = 'border-purple-500';
//         textColor = 'text-purple-500';
//         break;
//       case 'protocol:atproto':
//         borderColor = 'border-blue-500';
//         textColor = 'text-blue-500';
//         break;
//       case 'protocol:activitypub':
//         borderColor = 'border-indigo-500';
//         textColor = 'text-indigo-500';
//         break;
//       default:
//         borderColor = status ? 'border-green-500' : 'border-red-500';
//         textColor = status ? 'text-green-500' : 'text-red-500';
//     }
//   }

//   const handleChangeFilters = (e: React.MouseEvent<HTMLButtonElement>) => {
//     e.stopPropagation();

//     if (['protocol:nostr', 'protocol:atproto', 'protocol:activitypub'].includes(value)) {
//       dispatch(selectProtocol(value));
//     } else if (['reply:false', 'media:true -video:true', 'video:true', '-media:true'].includes(value)) {
//       dispatch(changeStatus({ value: value, status: false }));
//     } else if (value.includes('language:')) {
//       dispatch(changeLanguage('default'));
//     } else {
//       dispatch(removeFilter(value));
//     }
//   };

//   return (
//     <div
//       key={value}
//       className={`group m-1 flex items-center whitespace-normal break-words rounded-full border-2 bg-transparent px-3 pr-1 text-base font-medium shadow-sm hover:cursor-pointer ${borderColor} ${textColor} `}
//     >
//       {name.toLowerCase() !== 'default' ? name : <FormattedMessage id='column.explore.filters.language.default' defaultMessage='Global' />}
//       <IconButton
//         iconClassName='!w-4' className={` !py-0 group-hover:block ${textColor}`} src={xIcon}
//         onClick={handleChangeFilters}
//         aria-label={intl.formatMessage(messages.removeFilter, { name })}
//       />
//     </div>
//   );
// };


export default ExploreFilter;
export type { IGenerateFilter };