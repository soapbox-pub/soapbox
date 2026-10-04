import ConfigDB from '@/utils/config-db.ts';

import { fetchConfig, updateConfig } from './admin.ts';

import type { MRFSimple } from '@/schemas/pleroma.ts';
import type { AppDispatch, RootState } from '@/store.ts';

const simplePolicyMerge = (simplePolicy: MRFSimple, host: string, restrictions: Record<string, any>) => {
  const entries = Object.entries(simplePolicy).map(([key, hosts]) => {
    const isRestricted = restrictions[key];
    const set = new Set(hosts);

    if (isRestricted) {
      set.add(host);
    } else {
      set.delete(host);
    }

    return [key, [...set]];
  });

  return Object.fromEntries(entries);
};

const updateMrf = (host: string, restrictions: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    dispatch(fetchConfig())
      .then(() => {
        const configs = getState().admin.configs;
        const simplePolicy = ConfigDB.toSimplePolicy(configs);
        const merged = simplePolicyMerge(simplePolicy, host, restrictions);
        const config = ConfigDB.fromSimplePolicy(merged);
        return dispatch(updateConfig(config));
      });

export { updateMrf };
