import { produce } from 'immer';

import { ADMIN_CONFIG_UPDATE_REQUEST, ADMIN_CONFIG_UPDATE_SUCCESS } from '@/actions/admin.ts';
import { InstanceV2, instanceV2Schema } from '@/schemas/instance.ts';
import { ConfigDB, type Config } from '@/utils/config-db.ts';

import { fetchInstanceV2 } from '../actions/instance.ts';

import type { AnyAction } from 'redux';

const initialState: InstanceV2 = instanceV2Schema.parse({});

const importConfigs = (state: InstanceV2, configs: Config[]) => {
  // FIXME: This is pretty hacked together. Need to make a cleaner map.
  const config = ConfigDB.find(configs, ':pleroma', ':instance');
  const simplePolicy = ConfigDB.toSimplePolicy(configs);

  if (!config && !simplePolicy) return state;

  return produce(state, (draft) => {
    if (config) {
      const registrationsOpen = ConfigDB.findTupleValue(config.value, ':registrations_open') as boolean | undefined;
      const approvalRequired = ConfigDB.findTupleValue(config.value, ':account_approval_required') as boolean | undefined;

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
      return importConfigs(state, action.configs ?? []);
    default:
      return state;
  }
}
