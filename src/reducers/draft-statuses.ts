import { List as ImmutableList, Map as ImmutableMap, OrderedSet as ImmutableOrderedSet, Record as ImmutableRecord, fromJS } from 'immutable';

import { COMPOSE_SUBMIT_SUCCESS } from 'soapbox/actions/compose';
import { DRAFT_STATUSES_FETCH_SUCCESS, PERSIST_DRAFT_STATUS, CANCEL_DRAFT_STATUS } from 'soapbox/actions/draft-statuses';
import KVStore from 'soapbox/storage/kv-store';

import type { AnyAction } from 'redux';
import type { StatusVisibility } from 'soapbox/normalizers/status';
import type { APIEntity, Attachment as AttachmentEntity } from 'soapbox/types/entities';

const DraftStatusRecord = ImmutableRecord({
  content_type: 'text/plain',
  draft_id: '',
  editorState: null as string | null,
  group_id: null as string | null,
  in_reply_to: null as string | null,
  media_attachments: ImmutableList<AttachmentEntity>(),
  poll: null as ImmutableMap<string, any> | null,
  privacy: 'public' as StatusVisibility,
  quote: null as string | null,
  schedule: null as Date | null,
  sensitive: false,
  spoiler: false,
  spoiler_text: '',
  text: '',
  to: ImmutableOrderedSet<string>(),
});

export type DraftStatus = ReturnType<typeof DraftStatusRecord>;
type State = ImmutableMap<string, DraftStatus>;

const initialState: State = ImmutableMap();

const importStatus = (state: State, status: APIEntity) => {
  return state.set(status.draft_id, DraftStatusRecord(ImmutableMap(fromJS(status))));
};

const importStatuses = (state: State, statuses: APIEntity[]) =>
  state.withMutations(mutable => Object.values(statuses || {}).forEach(status => importStatus(mutable, status)));

const deleteStatus = (state: State, id: string) => {
  if (id) return state.delete(id);
  return state;
};

const persistState = (state: State, accountId: string) => {
  KVStore.setItem(`drafts:${accountId}`, state.toJS());
  return state;
};

export default function scheduled_statuses(state: State = initialState, action: AnyAction) {
  switch (action.type) {
    case DRAFT_STATUSES_FETCH_SUCCESS:
      return importStatuses(state, action.statuses);
    case PERSIST_DRAFT_STATUS:
      return persistState(importStatus(state, action.status), action.accountId);
    case CANCEL_DRAFT_STATUS:
      return persistState(deleteStatus(state, action.id), action.accountId);
    case COMPOSE_SUBMIT_SUCCESS:
      return persistState(deleteStatus(state, action.draftId), action.accountId);
    default:
      return state;
  }
}
