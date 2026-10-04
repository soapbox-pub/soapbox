import {
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_SUCCESS,
} from '@/actions/statuses.ts';
import { fromDefaults } from '@/utils/normalizers.ts';

import type { StatusVisibility } from '@/normalizers/status.ts';
import type { AnyAction } from 'redux';

export interface PendingStatus {
  content_type: string;
  in_reply_to_id: string | null;
  media_ids: string[] | null;
  quote_id: string | null;
  poll: { options?: string[]; [key: string]: unknown } | null;
  sensitive: boolean;
  spoiler_text: string;
  status: string;
  to: string[] | null;
  visibility: StatusVisibility;
}

type State = Record<string, PendingStatus>;

const initialState: State = {};

const importStatus = (state: State, params: Record<string, any>, idempotencyKey: string): State => {
  const pendingStatus = fromDefaults<PendingStatus>({
    content_type: '',
    in_reply_to_id: null,
    media_ids: null,
    quote_id: null,
    poll: null,
    sensitive: false,
    spoiler_text: '',
    status: '',
    to: null,
    visibility: 'public',
  }, params);

  return { ...state, [idempotencyKey]: pendingStatus };
};

const deleteStatus = (state: State, idempotencyKey: string): State => {
  const { [idempotencyKey]: _, ...rest } = state;
  return rest;
};

export default function pending_statuses(state = initialState, action: AnyAction): State {
  switch (action.type) {
    case STATUS_CREATE_REQUEST:
      return action.editing ? state : importStatus(state, action.params, action.idempotencyKey);
    case STATUS_CREATE_SUCCESS:
      return deleteStatus(state, action.idempotencyKey);
    default:
      return state;
  }
}
