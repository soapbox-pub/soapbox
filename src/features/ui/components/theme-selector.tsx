import chevronDownIcon from '@tabler/icons/outline/chevron-down.svg';
import deviceDesktopIcon from '@tabler/icons/outline/device-desktop.svg';
import moonIcon from '@tabler/icons/outline/moon.svg';
import shadowIcon from '@tabler/icons/outline/shadow.svg';
import sunIcon from '@tabler/icons/outline/sun.svg';
import React, { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Icon, Select } from 'soapbox/components/ui';

const messages = defineMessages({
  light: { id: 'theme_toggle.light', defaultMessage: 'Light' },
  dark: { id: 'theme_toggle.dark', defaultMessage: 'Dark' },
  black: { id: 'theme_toggle.black', defaultMessage: 'Black' },
  system: { id: 'theme_toggle.system', defaultMessage: 'System' },
});

interface IThemeSelector {
  value: string;
  onChange: (value: string) => void;
}

/** Pure theme selector. */
const ThemeSelector: React.FC<IThemeSelector> = ({ value, onChange }) => {
  const intl = useIntl();

  const themeIconSrc = useMemo(() => {
    switch (value) {
      case 'system':
        return deviceDesktopIcon;
      case 'light':
        return sunIcon;
      case 'dark':
        return moonIcon;
      case 'black':
        return shadowIcon;
      default:
        return deviceDesktopIcon;
    }
  }, [value]);

  const handleChange: React.ChangeEventHandler<HTMLSelectElement> = e => {
    onChange(e.target.value);
  };

  return (
    <label>
      <div className='relative rounded-md shadow-sm'>
        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
          <Icon src={themeIconSrc} className='size-4 text-gray-600 dark:text-gray-700' />
        </div>

        <Select
          onChange={handleChange}
          defaultValue={value}
          className='!pl-10'
        >
          <option value='system'>{intl.formatMessage(messages.system)}</option>
          <option value='light'>{intl.formatMessage(messages.light)}</option>
          <option value='dark'>{intl.formatMessage(messages.dark)}</option>
          <option value='black'>{intl.formatMessage(messages.black)}</option>
        </Select>

        <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3'>
          <Icon src={chevronDownIcon} className='size-4 text-gray-600 dark:text-gray-700' />
        </div>
      </div>
    </label>
  );
};

export default ThemeSelector;
