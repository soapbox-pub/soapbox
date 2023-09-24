import { produce } from 'immer';
import { Map as ImmutableMap, List as ImmutableList, fromJS } from 'immutable';

import { ADMIN_CONFIG_UPDATE_REQUEST, ADMIN_CONFIG_UPDATE_SUCCESS } from 'soapbox/actions/admin';
import { PLEROMA_PRELOAD_IMPORT } from 'soapbox/actions/preload';
import { type Instance, instanceSchema } from 'soapbox/schemas';
import KVStore from 'soapbox/storage/kv-store';
import { ConfigDB } from 'soapbox/utils/config-db';

import {
  rememberInstance,
  fetchInstance,
} from '../actions/instance';

import type { AnyAction } from 'redux';

const initialState: Instance = instanceSchema.parse({});

const importInstance = (_state: typeof initialState, instance: unknown) => {
  return instanceSchema.parse(instance);
};

const preloadImport = (state: typeof initialState, action: Record<string, any>, path: string) => {
  const instance = action.data[path];
  return instance ? importInstance(state, instance) : state;
};

const getConfigValue = (instanceConfig: ImmutableMap<string, any>, key: string) => {
  const v = instanceConfig
    .find(value => value.getIn(['tuple', 0]) === key);

  return v ? v.getIn(['tuple', 1]) : undefined;
};

const importConfigs = (state: typeof initialState, configs: ImmutableList<any>) => {
  // FIXME: This is pretty hacked together. Need to make a cleaner map.
  const config = ConfigDB.find(configs, ':pleroma', ':instance');
  const simplePolicy = ConfigDB.toSimplePolicy(configs);

  if (!config && !simplePolicy) return state;

  return produce(state, (draft) => {
    if (config) {
      const value = config.get('value', ImmutableList());
      const registrationsOpen = getConfigValue(value, ':registrations_open') as boolean | undefined;
      const approvalRequired = getConfigValue(value, ':account_approval_required') as boolean | undefined;

      draft.registrations = registrationsOpen ?? draft.registrations;
      draft.approval_required = approvalRequired ?? draft.approval_required;
    }

    if (simplePolicy) {
      draft.pleroma.metadata.federation.mrf_simple = simplePolicy;
    }
  });
};

const handleAuthFetch = (state: typeof initialState) => {
  // Authenticated fetch is enabled, so make the instance appear censored
  return {
    ...state,
    title: state.title || '██████',
    description: state.description || '████████████',
  };
};

const getHost = (instance: { uri: string }) => {
  try {
    return new URL(instance.uri).host;
  } catch {
    try {
      return new URL(`https://${instance.uri}`).host;
    } catch {
      return null;
    }
  }
};

const persistInstance = (instance: { uri: string }) => {
  const host = getHost(instance);

  if (host) {
    KVStore.setItem(`instance:${host}`, instance).catch(console.error);
  }
};

const handleInstanceFetchFail = (state: typeof initialState, error: Record<string, any>) => {
  if (error.response?.status === 401) {
    return handleAuthFetch(state);
  } else {
    return state;
  }
};

export default function instance(state = initialState, action: AnyAction) {
  switch (action.type) {
    case PLEROMA_PRELOAD_IMPORT:
      return preloadImport(state, action, '/api/v1/instance');
    case rememberInstance.fulfilled.type:
      return importInstance(state, action.payload);
    case fetchInstance.fulfilled.type:
      persistInstance(action.payload);
      return importInstance(state, action.payload);
    case fetchInstance.rejected.type:
      return handleInstanceFetchFail(state, action.error);
    case ADMIN_CONFIG_UPDATE_REQUEST:
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return importConfigs(state, ImmutableList(fromJS(action.configs)));
    default:
      return state;
  }
}
