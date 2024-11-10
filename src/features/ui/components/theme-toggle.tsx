import { changeSetting } from 'soapbox/actions/settings.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useSettings } from 'soapbox/hooks/useSettings.ts';

import ThemeSelector from './theme-selector.tsx';

/** Stateful theme selector. */
const ThemeToggle: React.FC = () => {
  const dispatch = useAppDispatch();
  const { themeMode } = useSettings();

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
