import React from 'react';

import { openDropdownMenu } from 'soapbox/actions/dropdown-menu';
import DropdownMenu, { MenuItem } from 'soapbox/components/dropdown-menu';
import SvgIcon from 'soapbox/components/ui/icon/svg-icon';
import { languages } from 'soapbox/features/preferences';
import { useAppDispatch } from 'soapbox/hooks';

const formatterLanguage = (lang: {}) => {
  const sigLanguage = Object.keys(lang).sort().map((sig) => {
    return sig.substring(0, 2);
  });

  return [...new Set(sigLanguage)];
};

interface ILanguageDropdown {
  language: string;
  setLanguage(language: string): void;
}

/**
 * Let the user select a language to filter the public timeline.
 */
const LanguageDropdown: React.FC<ILanguageDropdown> = ({ language, setLanguage }) => {
  const dispatch = useAppDispatch();
  const formattedLanguage = formatterLanguage(languages);

  const newMenu: MenuItem[] = [{ icon: require('@tabler/icons/outline/world.svg'), text: 'Default', action: () => {
    setLanguage('');
  } }];

  formattedLanguage.map((lg: string) => {
    const languageText = languages[lg as keyof typeof languages];

    if (languageText !== undefined) {
      newMenu.push({
        text: `${lg.toUpperCase()} - ${languageText}`,
        action: () => {
          setLanguage(lg.toUpperCase());
        },
      });
    }
  });


  return (
    <DropdownMenu items={newMenu} modal>
      {language ? (
        <button type='button' className='flex h-full rounded-lg border-2 border-gray-700 px-1 text-gray-700 hover:cursor-pointer hover:border-gray-500 hover:text-gray-500 sm:mr-4 dark:border-white dark:text-white dark:hover:border-gray-700' onClick={() => dispatch(openDropdownMenu())}>
          {language}
        </button>
      ) : (
        <SvgIcon src={require('@tabler/icons/outline/world.svg')} className='text-gray-700 hover:cursor-pointer hover:text-gray-500 black:absolute black:right-0 black:top-4 black:text-white black:hover:text-gray-600 sm:mr-4 dark:text-white' />
      )}
    </DropdownMenu>
  );
};


export { LanguageDropdown };