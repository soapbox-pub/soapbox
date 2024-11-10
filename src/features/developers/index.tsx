import { getSettings } from 'soapbox/actions/settings.ts';
import { useAppSelector } from 'soapbox/hooks/index.ts';

import DevelopersChallenge from './developers-challenge.tsx';
import DevelopersMenu from './developers-menu.tsx';

const Developers: React.FC = () => {
  const isDeveloper = useAppSelector((state) => getSettings(state).get('isDeveloper'));

  return isDeveloper ? <DevelopersMenu /> : <DevelopersChallenge />;
};

export default Developers;
