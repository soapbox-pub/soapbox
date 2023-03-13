import { parseVersion } from 'soapbox/utils/features';

import { useInstance } from './useInstance';

/**
 * Get the Backend version.
 *
 * @returns Backend
 */
const useVersion = () => {
  const instance = useInstance();

  return parseVersion(instance.version);
};

export { useVersion };