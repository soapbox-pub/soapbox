import { List as ImmutableList, Map as ImmutableMap, fromJS } from 'immutable';

import { PLEROMA_PRELOAD_IMPORT } from 'soapbox/actions/preload';
import KVStore from 'soapbox/storage/kv-store';
import { ConfigDB } from 'soapbox/utils/config-db';

import { ADMIN_CONFIG_UPDATE_SUCCESS } from '../actions/admin';
import {
  SOAPBOX_CONFIG_REMEMBER_SUCCESS,
  SOAPBOX_CONFIG_REQUEST_SUCCESS,
  SOAPBOX_CONFIG_REQUEST_FAIL,
} from '../actions/soapbox';

const initialState = ImmutableMap<string, any>();

const fallbackState = ImmutableMap<string, any>({
  brandColor: '#0482d8', // Azure
});

const updateFromAdmin = (state: ImmutableMap<string, any>, configs: ImmutableList<ImmutableMap<string, any>>) => {
  try {
    return ConfigDB.find(configs, ':pleroma', ':frontend_configurations')!
      .get('value')
      .find((value: ImmutableMap<string, any>) => value.getIn(['tuple', 0]) === ':soapbox_fe')
      .getIn(['tuple', 1]);
  } catch {
    return state;
  }
};

const preloadImport = (state: ImmutableMap<string, any>, action: Record<string, any>) => {
  const path = '/api/pleroma/frontend_configurations';
  const feData = action.data[path];

  if (feData) {
    const soapbox = feData.soapbox_fe;
    return soapbox ? fallbackState.mergeDeep(fromJS(soapbox)) : fallbackState;
  } else {
    return state;
  }
};

const persistSoapboxConfig = (soapboxConfig: ImmutableMap<string, any>, host: string) => {
  if (host) {
    KVStore.setItem(`soapbox_config:${host}`, soapboxConfig.toJS()).catch(console.error);
  }
};

const importSoapboxConfig = (state: ImmutableMap<string, any>, soapboxConfig: ImmutableMap<string, any>, host: string) => {
  persistSoapboxConfig(soapboxConfig, host);
  return soapboxConfig;
};

export default function soapbox(state = initialState, action: Record<string, any>) {
  switch (action.type) {
    case PLEROMA_PRELOAD_IMPORT:
      return preloadImport(state, action);
    case SOAPBOX_CONFIG_REMEMBER_SUCCESS:
      return fromJS(action.soapboxConfig);
    case SOAPBOX_CONFIG_REQUEST_SUCCESS:
      return importSoapboxConfig(state, fromJS(action.soapboxConfig) as ImmutableMap<string, any>, action.host);
    case SOAPBOX_CONFIG_REQUEST_FAIL:
      return fallbackState.mergeDeep(state);
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return updateFromAdmin(state, fromJS(action.configs) as ImmutableList<ImmutableMap<string, any>>);
    default:
      return state;
  }
}
