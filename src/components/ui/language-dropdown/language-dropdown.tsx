import React, { useState } from 'react';

import { openDropdownMenu } from 'soapbox/actions/dropdown-menu';
import { clearTimeline, expandPublicTimeline } from 'soapbox/actions/timelines';
import DropdownMenu from 'soapbox/components/dropdown-menu';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import { languages } from 'soapbox/features/preferences';
import { useAppDispatch } from 'soapbox/hooks';

const formatterLanguage = (lang: {}) => {

  const sigLanguage = Object.keys(lang).sort().map((sig) => {
    return sig.substring(0, 2);
  });

  return [...new Set(sigLanguage)];
};

/**
 *
 */
const LanguageDropdown = () => {
  const dispatch = useAppDispatch();
  const [languageIcon, setLanguageIcon] = useState('');

  const handleChangeLanguage = (language?: string) => {
    if (language) {
      dispatch(clearTimeline('public'));
      dispatch(expandPublicTimeline({ url: `/api/v1/timelines/public?language=${language}` }));
    } else {
      dispatch(clearTimeline('public'));
      dispatch(expandPublicTimeline({ url: '/api/v1/timelines/public' }));
    }
  };

  const formattedLanguage = formatterLanguage(languages);

  const newMenu: any[] = [{ icon: require('@tabler/icons/outline/world.svg'), text: 'Default', action: () => {
    setLanguageIcon('');
    handleChangeLanguage();
  } }];

  formattedLanguage.map((lg: string) => {
    const languageText = languages[lg as keyof typeof languages];

    if (languageText !== undefined) {
      newMenu.push({
        text: `${lg.toUpperCase()} - ${languageText}`,
        action: () => {
          setLanguageIcon(lg.toUpperCase());
          handleChangeLanguage(lg);
        },
      });
    }
  });


  return (
    <DropdownMenu items={newMenu} modal>
      { languageIcon === '' ?
        <SvgIcon src={require('@tabler/icons/outline/world.svg')} className='hover:cursor-pointer hover:text-gray-600 black:absolute black:right-0 black:top-4 black:text-white black:hover:text-gray-600 sm:mr-4' />

        :
        <button type='button' className='flex h-full rounded-lg border-2 border-black px-1 text-black hover:cursor-pointer hover:border-gray-600 hover:text-gray-600 black:absolute black:right-0 black:top-4 black:h-7 black:text-white black:hover:text-gray-600 sm:mr-4 dark:border-white dark:text-white dark:hover:border-gray-700' onClick={() => dispatch(openDropdownMenu())}>
          {languageIcon}
        </button>
      }
    </DropdownMenu>
  );
};


export { LanguageDropdown };