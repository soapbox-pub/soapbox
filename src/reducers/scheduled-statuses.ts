import { STATUS_IMPORT, STATUSES_IMPORT } from '@/actions/importer/index.ts';
import {
  SCHEDULED_STATUSES_FETCH_SUCCESS,
  SCHEDULED_STATUS_CANCEL_REQUEST,
  SCHEDULED_STATUS_CANCEL_SUCCESS,
} from '@/actions/scheduled-statuses.ts';
import { STATUS_CREATE_SUCCESS } from '@/actions/statuses.ts';
import { fromDefaults } from '@/utils/normalizers.ts';

import type { StatusVisibility } from '@/normalizers/status.ts';
import type { APIEntity } from '@/types/entities.ts';
import type { AnyAction } from 'redux';

export interface ScheduledStatus {
  id: string;
  scheduled_at: Date | string;
  media_attachments: Record<string, any>[] | null;
  text: string;
  in_reply_to_id: string | null;
  media_ids: string[] | null;
  sensitive: boolean;
  spoiler_text: string;
  visibility: StatusVisibility;
  poll: Record<string, any> | null;
}

type State = Record<string, ScheduledStatus>;

const initialState: State = {};

const normalizeScheduledStatus = ({ params, ...status }: APIEntity): ScheduledStatus => {
  return fromDefaults<ScheduledStatus>({
    id: '',
    scheduled_at: new Date(),
    media_attachments: null,
    text: '',
    in_reply_to_id: null,
    media_ids: null,
    sensitive: false,
    spoiler_text: '',
    visibility: 'public',
    poll: null,
  }, { ...status, ...params });
};

const importStatuses = (state: State, statuses: APIEntity[]): State => {
  const scheduled = statuses.filter(status => status.scheduled_at);
  if (!scheduled.length) return state;

  const result = { ...state };

  scheduled.forEach(status => {
    result[status.id] = normalizeScheduledStatus(status);
  });

  return result;
};

const deleteStatus = (state: State, id: string): State => {
  const { [id]: _, ...rest } = state;
  return rest;
};

export default function scheduled_statuses(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case STATUS_IMPORT:
    case STATUS_CREATE_SUCCESS:
      return importStatuses(state, [action.status]);
    case STATUSES_IMPORT:
    case SCHEDULED_STATUSES_FETCH_SUCCESS:
      return importStatuses(state, action.statuses);
    case SCHEDULED_STATUS_CANCEL_REQUEST:
    case SCHEDULED_STATUS_CANCEL_SUCCESS:
      return deleteStatus(state, action.id);
    default:
      return state;
  }
}
