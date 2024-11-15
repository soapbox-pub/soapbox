import { parseVersion } from 'soapbox/utils/features.ts';

import { useInstance } from './useInstance.ts';

/**
 * Get the Backend version.
 *
 * @returns Backend
 */
const useBackend = () => {
  const { instance } = useInstance();

  return parseVersion(instance.version);
};

export { useBackend };