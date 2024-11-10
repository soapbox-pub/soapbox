import { getFeatures, Features } from 'soapbox/utils/features.ts';

import { useInstance } from './useInstance.ts';

/** Get features for the current instance. */
export const useFeatures = (): Features => {
  const { instance } = useInstance();
  return getFeatures(instance);
};
