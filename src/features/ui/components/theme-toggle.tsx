import { changeSetting } from 'soapbox/actions/settings.ts';
import { useAppDispatch, useSettings } from 'soapbox/hooks/index.ts';

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
