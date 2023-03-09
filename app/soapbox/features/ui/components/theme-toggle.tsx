import React from 'react';

import { changeSetting } from 'soapbox/actions/settings';
import { useAppDispatch, useSettings } from 'soapbox/hooks';

import ThemeSelector from './theme-selector';

/** Stateful theme selector. */
const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const themeMode = useSettings().get('themeMode');

  const handleChange = (themeMode: string) => {
    dispatch(changeSetting(['themeMode'], themeMode));
  };

  return (
    <ThemeSelector
      value={themeMode}
      onChange={handleChange}
    />
  );
};

export default ThemeToggle;
