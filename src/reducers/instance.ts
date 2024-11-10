import { produce } from 'immer';
import { Map as ImmutableMap, List as ImmutableList, fromJS } from 'immutable';

import { ADMIN_CONFIG_UPDATE_REQUEST, ADMIN_CONFIG_UPDATE_SUCCESS } from 'soapbox/actions/admin.ts';
import { InstanceV2, instanceV2Schema } from 'soapbox/schemas/instance.ts';
import { ConfigDB } from 'soapbox/utils/config-db.ts';

import { fetchInstanceV2 } from '../actions/instance.ts';

import type { AnyAction } from 'redux';

const initialState: InstanceV2 = instanceV2Schema.parse({});

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

export default function instance(state = initialState, action: AnyAction): InstanceV2 {
  switch (action.type) {
    case fetchInstanceV2.fulfilled.type:
      return action.payload.instance;
    case ADMIN_CONFIG_UPDATE_REQUEST:
    case ADMIN_CONFIG_UPDATE_SUCCESS:
      return importConfigs(state, ImmutableList(fromJS(action.configs)));
    default:
      return state;
  }
}
