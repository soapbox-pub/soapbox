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
 * A dropdown menu component for selecting the display language of the public timeline.
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
        <SvgIcon src={require('@tabler/icons/outline/world.svg')} className='text-gray-700 hover:cursor-pointer hover:text-gray-500 black:absolute black:right-0 black:top-4 black:text-white black:hover:text-gray-600 sm:mr-4 dark:text-white' />

        :
        <button type='button' className='flex h-full rounded-lg border-2 border-gray-700 px-1 text-gray-700 hover:cursor-pointer hover:border-gray-500 hover:text-gray-500 sm:mr-4 dark:border-white dark:text-white dark:hover:border-gray-700' onClick={() => dispatch(openDropdownMenu())}>
          {languageIcon}
        </button>
      }
    </DropdownMenu>
  );
};


export { LanguageDropdown };