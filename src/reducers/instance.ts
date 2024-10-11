import { produce } from 'immer';
import { Map as ImmutableMap, List as ImmutableList, fromJS } from 'immutable';

import { ADMIN_CONFIG_UPDATE_REQUEST, ADMIN_CONFIG_UPDATE_SUCCESS } from 'soapbox/actions/admin';
import { PLEROMA_PRELOAD_IMPORT } from 'soapbox/actions/preload';
import { InstanceV1, instanceV1Schema, InstanceV2, instanceV2Schema, upgradeInstance } from 'soapbox/schemas/instance';
import KVStore from 'soapbox/storage/kv-store';
import { ConfigDB } from 'soapbox/utils/config-db';

import {
  fetchInstance,
  fetchInstanceV2,
} from '../actions/instance';

import type { AnyAction } from 'redux';

const initialState: InstanceV2 = instanceV2Schema.parse({});

const importInstanceV1 = (_state: InstanceV2, instance: InstanceV1): InstanceV2 => {
  return upgradeInstance(instanceV1Schema.parse(instance));
};

const importInstanceV2 = (_state: InstanceV2, data: InstanceV2): InstanceV2 => {
  return instanceV2Schema.parse(data);
};

const preloadImport = (state: InstanceV2, action: Record<string, any>, path: string) => {
  const instance = action.data[path];
  return instance ? importInstanceV1(state, instance) : state;
};

const getConfigValue = (instanceConfig: ImmutableMap<string, any>, key: string) => {
  const v = instanceConfig
    .find(value => value.getIn(['tuple', 0]) === key);

  return v ? v.getIn(['tuple', 1]) : undefined;
};

const importConfigs = (state: InstanceV2, configs: ImmutableList<any>) => {
  // FIXME: This is pretty hacked together. Need to make a cleaner map.
  const config = ConfigDB.find(configs, ':pleroma', ':instance');
  const simplePolicy = ConfigDB.toSimplePolicy(configs);

  if (!config && !simplePolicy) return state;

  return produce(state, (draft) => {
    if (config) {
      const value = config.get('value', ImmutableList());
      const registrationsOpen = getConfigValue(value, ':registrations_open') as boolean | undefined;
      const approvalRequired = getConfigValue(value, ':account_approval_required') as boolean | undefined;

      draft.registrations = {
        enabled: registrationsOpen ?? draft.registrations.enabled,
        approval_required: approvalRequired ?? draft.registrations.approval_required,
      };
    }

    if (simplePolicy) {
      draft.pleroma.metadata.federation.mrf_simple = simplePolicy;
    }
  });
};

const handleAuthFetch = (state: InstanceV1 | InstanceV2) => {
  // Authenticated fetch is enabled, so make the instance appear censored
  return {
    ...state,
    title: state.title || '██████',
    description: state.description || '████████████',
  };
};

const getHost = (instance: { uri?: string; domain?: string }) => {
  const domain = instance.uri || instance.domain as string;
  try {
    return new URL(domain).host;
  } catch {
    try {
      return new URL(`https://${domain}`).host;
    } catch {
      return null;
    }
  }
};

const persistInstance = ({ instance }: { instance: { uri: string } }, host: string | null = getHost(instance)) => {
  if (host) {
    KVStore.setItem(`instance:${host}`, instance).catch(console.error);
  }
};

const persistInstanceV2 = ({ instance }: { instance: { domain: string } }, host: string | null = getHost(instance)) => {
  if (host) {
    KVStore.setItem(`instanceV2:${host}`, instance).catch(console.error);
  }
};

const handleInstanceFetchFail = (state: InstanceV2, error: Record<string, any>) => {
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
    case fetchInstance.fulfilled.type:
      persistInstance(action.payload);
      return importInstanceV1(state, action.payload.instance);
    case fetchInstanceV2.fulfilled.type:
      persistInstanceV2(action.payload);
      return importInstanceV2(state, action.payload.instance);
    case fetchInstance.rejected.type:
      return handleInstanceFetchFail(state, action.error);
    case ADMIN_CONFIG_UPDATE_REQUEST:
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return importConfigs(state, ImmutableList(fromJS(action.configs)));
    default:
      return state;
  }
}
