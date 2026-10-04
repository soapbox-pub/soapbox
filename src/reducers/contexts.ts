import { produce, type Draft } from 'immer';

import { STATUS_IMPORT, STATUSES_IMPORT } from '@/actions/importer/index.ts';

import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
} from '../actions/accounts.ts';
import {
  CONTEXT_FETCH_SUCCESS,
  STATUS_CREATE_REQUEST,
  STATUS_CREATE_SUCCESS,
} from '../actions/statuses.ts';
import { TIMELINE_DELETE } from '../actions/timelines.ts';

import type { ReducerStatus } from '@/reducers/statuses.ts';
import type { AnyAction } from 'redux';

interface State {
  inReplyTos: Record<string, string>;
  replies: Record<string, string[]>;
}

export const initialState: State = {
  inReplyTos: {},
  replies: {},
};

type DraftState = Draft<State>;

/** Minimal status fields needed to process context. */
type ContextStatus = {
  id: string;
  in_reply_to_id: string | null;
}

/** Import a single status into the reducer, setting replies and replyTos. */
const importStatus = (state: DraftState, status: ContextStatus, idempotencyKey?: string) => {
  const { id, in_reply_to_id: inReplyToId } = status;
  if (!inReplyToId) return;

  const replies = state.replies[inReplyToId] || [];
  const newReplies = [...new Set([...replies, id])].sort();

  state.replies[inReplyToId] = newReplies;
  state.inReplyTos[id] = inReplyToId;

  if (idempotencyKey) {
    deletePendingStatus(state, status, idempotencyKey);
  }
};

/** Import multiple statuses into the state. */
const importStatuses = (state: DraftState, statuses: ContextStatus[]) => {
  statuses.forEach(status => importStatus(state, status));
};

/** Insert a fake status ID connecting descendant to ancestor. */
const insertTombstone = (state: DraftState, ancestorId: string, descendantId: string) => {
  const tombstoneId = `${descendantId}-tombstone`;
  importStatus(state, { id: tombstoneId, in_reply_to_id: ancestorId });
  importStatus(state, { id: descendantId, in_reply_to_id: tombstoneId });
};

/** Find the highest level status from this statusId. */
const getRootNode = (state: DraftState, statusId: string, initialId = statusId): string => {
  const parent = state.inReplyTos[statusId];

  if (!parent) {
    return statusId;
  } else if (parent === initialId) {
    // Prevent cycles
    return parent;
  } else {
    return getRootNode(state, parent, initialId);
  }
};

/** Route fromId to toId by inserting tombstones. */
const connectNodes = (state: DraftState, fromId: string, toId: string) => {
  const fromRoot = getRootNode(state, fromId);
  const toRoot   = getRootNode(state, toId);

  if (fromRoot !== toRoot) {
    insertTombstone(state, toId, fromId);
  }
};

/** Import a branch of ancestors or descendants, in relation to statusId. */
const importBranch = (state: DraftState, statuses: ContextStatus[], statusId?: string) => {
  statuses.forEach((status, i) => {
    const prevId = statusId && i === 0 ? statusId : (statuses[i - 1] || {}).id;

    if (status.in_reply_to_id) {
      importStatus(state, status);

      // On Mastodon, in_reply_to_id can refer to an unavailable status,
      // so traverse the tree up and insert a connecting tombstone if needed.
      if (statusId) {
        connectNodes(state, status.id, statusId);
      }
    } else if (prevId) {
      // On Pleroma, in_reply_to_id will be null if the parent is unavailable,
      // so insert the tombstone now.
      insertTombstone(state, prevId, status.id);
    }
  });
};

/** Import a status's ancestors and descendants. */
const normalizeContext = (
  state: DraftState,
  id: string,
  ancestors: ContextStatus[],
  descendants: ContextStatus[],
) => {
  importBranch(state, ancestors);
  importBranch(state, descendants, id);

  if (ancestors.length > 0 && !state.inReplyTos[id]) {
    insertTombstone(state, ancestors[ancestors.length - 1].id, id);
  }
};

/** Remove a status from the reducer. */
const deleteStatus = (state: DraftState, id: string) => {
  // Delete from its parent's tree
  const parentId = state.inReplyTos[id];
  if (parentId) {
    const parentReplies = state.replies[parentId] || [];
    state.replies[parentId] = parentReplies.filter(reply => reply !== id);
  }

  // Dereference children
  const replies = state.replies[id] || [];
  replies.forEach(reply => {
    delete state.inReplyTos[reply];
  });

  delete state.inReplyTos[id];
  delete state.replies[id];
};

/** Delete multiple statuses from the reducer. */
const deleteStatuses = (state: DraftState, ids: string[]) => {
  ids.forEach(id => deleteStatus(state, id));
};

/** Delete statuses upon blocking or muting a user. */
const filterContexts = (
  state: DraftState,
  relationship: { id: string },
  /** The entire statuses map from the store. */
  statuses: Record<string, ReducerStatus>,
) => {
  const ownedStatusIds = Object.values(statuses)
    .filter(status => status.account?.id === relationship.id)
    .map(status => status.id);

  deleteStatuses(state, ownedStatusIds);
};

/** Add a fake status ID for a pending status. */
const importPendingStatus = (state: DraftState, params: ContextStatus, idempotencyKey: string) => {
  const id = `末pending-${idempotencyKey}`;
  const { in_reply_to_id } = params;
  importStatus(state, { id, in_reply_to_id });
};

/** Delete a pending status from the reducer. */
const deletePendingStatus = (state: DraftState, params: ContextStatus, idempotencyKey: string) => {
  const id = `末pending-${idempotencyKey}`;
  const { in_reply_to_id: inReplyToId } = params;

  delete state.inReplyTos[id];

  if (inReplyToId) {
    const replies = state.replies[inReplyToId] || [];
    state.replies[inReplyToId] = replies.filter(reply => reply !== id).sort();
  }
};

/** Contexts reducer. Used for building a nested tree structure for threads. */
export default function replies(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case ACCOUNT_BLOCK_SUCCESS:
    case ACCOUNT_MUTE_SUCCESS:
      return produce(state, draft => filterContexts(draft, action.relationship, action.statuses));
    case CONTEXT_FETCH_SUCCESS:
      return produce(state, draft => normalizeContext(draft, action.id, action.ancestors, action.descendants));
    case TIMELINE_DELETE:
      return produce(state, draft => deleteStatuses(draft, [action.id]));
    case STATUS_CREATE_REQUEST:
      return produce(state, draft => importPendingStatus(draft, action.params, action.idempotencyKey));
    case STATUS_CREATE_SUCCESS:
      return produce(state, draft => deletePendingStatus(draft, action.status, action.idempotencyKey));
    case STATUS_IMPORT:
      return produce(state, draft => importStatus(draft, action.status, action.idempotencyKey));
    case STATUSES_IMPORT:
      return produce(state, draft => importStatuses(draft, action.statuses));
    default:
      return state;
  }
}
