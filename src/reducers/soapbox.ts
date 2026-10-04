import { PLEROMA_PRELOAD_IMPORT } from '@/actions/preload.ts';
import { ConfigDB, type Config } from '@/utils/config-db.ts';
import { mergeDeep } from '@/utils/merge-deep.ts';

import { ADMIN_CONFIG_UPDATE_SUCCESS } from '../actions/admin.ts';
import {
  SOAPBOX_CONFIG_REMEMBER_SUCCESS,
  SOAPBOX_CONFIG_REQUEST_SUCCESS,
  SOAPBOX_CONFIG_REQUEST_FAIL,
} from '../actions/soapbox.ts';

/** Raw Soapbox config, as received from the server. Use `useSoapboxConfig()` to get the normalized version. */
type State = Record<string, unknown>;

const initialState: State = {};

const fallbackState: State = {
  brandColor: '#0482d8', // Azure
};

const updateFromAdmin = (state: State, configs: Config[]): State => {
  const config = ConfigDB.find(configs, ':pleroma', ':frontend_configurations');
  const value = ConfigDB.findTupleValue(config?.value, ':soapbox_fe');

  if (config && value !== undefined) {
    return value as State;
  } else {
    return state;
  }
};

const preloadImport = (state: State, action: Record<string, any>): State => {
  const path = '/api/pleroma/frontend_configurations';
  const feData = action.data[path];

  if (feData) {
    const soapbox = feData.soapbox_fe;
    return soapbox ? mergeDeep(fallbackState, soapbox) : fallbackState;
  } else {
    return state;
  }
};

export default function soapbox(state: State = initialState, action: Record<string, any>): State {
  switch (action.type) {
    case PLEROMA_PRELOAD_IMPORT:
      return preloadImport(state, action);
    case SOAPBOX_CONFIG_REMEMBER_SUCCESS:
      return action.soapboxConfig ?? {};
    case SOAPBOX_CONFIG_REQUEST_SUCCESS:
      return action.soapboxConfig ?? {};
    case SOAPBOX_CONFIG_REQUEST_FAIL:
      return mergeDeep(fallbackState, state);
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return updateFromAdmin(state, action.configs ?? []);
    default:
      return state;
  }
}
