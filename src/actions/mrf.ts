import { Set as ImmutableSet } from 'immutable';

import ConfigDB from 'soapbox/utils/config-db';

import { fetchConfig, updateConfig } from './admin';

import type { MRFSimple } from 'soapbox/schemas/pleroma';
import type { AppDispatch, RootState } from 'soapbox/store';

const simplePolicyMerge = (simplePolicy: MRFSimple, host: string, restrictions: Record<string, any>) => {
  const entries = Object.entries(simplePolicy).map(([key, hosts]) => {
    const isRestricted = restrictions[key];

    if (isRestricted) {
      return [key, ImmutableSet(hosts).add(host).toJS()];
    } else {
      return [key, ImmutableSet(hosts).delete(host).toJS()];
    }
  });

  return Object.fromEntries(entries);
};

const updateMrf = (host: string, restrictions: Record<string, any>) =>
  (dispatch: AppDispatch, getState: () => RootState) =>
    dispatch(fetchConfig())
      .then(() => {
        const configs = getState().admin.get('configs');
        const simplePolicy = ConfigDB.toSimplePolicy(configs);
        const merged = simplePolicyMerge(simplePolicy, host, restrictions);
        const config = ConfigDB.fromSimplePolicy(merged);
        return dispatch(updateConfig(config.toJS() as Array<Record<string, any>>));
      });

export { updateMrf };
