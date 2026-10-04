import { produce, type Draft } from 'immer';
import { AnyAction } from 'redux';

import {
  FOLLOWERS_FETCH_SUCCESS,
  FOLLOWERS_EXPAND_SUCCESS,
  FOLLOWING_FETCH_SUCCESS,
  FOLLOWING_EXPAND_SUCCESS,
  FOLLOW_REQUESTS_FETCH_SUCCESS,
  FOLLOW_REQUESTS_EXPAND_SUCCESS,
  FOLLOW_REQUEST_AUTHORIZE_SUCCESS,
  FOLLOW_REQUEST_REJECT_SUCCESS,
  PINNED_ACCOUNTS_FETCH_SUCCESS,
  BIRTHDAY_REMINDERS_FETCH_SUCCESS,
} from '@/actions/accounts.ts';
import {
  BLOCKS_FETCH_SUCCESS,
  BLOCKS_EXPAND_SUCCESS,
} from '@/actions/blocks.ts';
import {
  DIRECTORY_FETCH_REQUEST,
  DIRECTORY_FETCH_SUCCESS,
  DIRECTORY_FETCH_FAIL,
  DIRECTORY_EXPAND_REQUEST,
  DIRECTORY_EXPAND_SUCCESS,
  DIRECTORY_EXPAND_FAIL,
} from '@/actions/directory.ts';
import {
  EVENT_PARTICIPATIONS_EXPAND_SUCCESS,
  EVENT_PARTICIPATIONS_FETCH_SUCCESS,
  EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS,
  EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS,
  EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS,
} from '@/actions/events.ts';
import {
  FAMILIAR_FOLLOWERS_FETCH_SUCCESS,
} from '@/actions/familiar-followers.ts';
import {
  GROUP_MEMBERSHIP_REQUESTS_FETCH_SUCCESS,
  GROUP_MEMBERSHIP_REQUESTS_EXPAND_SUCCESS,
  GROUP_MEMBERSHIP_REQUESTS_FETCH_REQUEST,
  GROUP_MEMBERSHIP_REQUESTS_EXPAND_REQUEST,
  GROUP_MEMBERSHIP_REQUESTS_FETCH_FAIL,
  GROUP_MEMBERSHIP_REQUESTS_EXPAND_FAIL,
  GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_SUCCESS,
  GROUP_MEMBERSHIP_REQUEST_REJECT_SUCCESS,
  GROUP_BLOCKS_FETCH_REQUEST,
  GROUP_BLOCKS_FETCH_SUCCESS,
  GROUP_BLOCKS_FETCH_FAIL,
  GROUP_BLOCKS_EXPAND_REQUEST,
  GROUP_BLOCKS_EXPAND_SUCCESS,
  GROUP_BLOCKS_EXPAND_FAIL,
  GROUP_UNBLOCK_SUCCESS,
} from '@/actions/groups.ts';
import {
  REBLOGS_FETCH_SUCCESS,
  REBLOGS_EXPAND_SUCCESS,
  FAVOURITES_FETCH_SUCCESS,
  FAVOURITES_EXPAND_SUCCESS,
  DISLIKES_FETCH_SUCCESS,
  REACTIONS_FETCH_SUCCESS,
} from '@/actions/interactions.ts';
import {
  NOTIFICATIONS_UPDATE,
} from '@/actions/notifications.ts';

import type { APIEntity } from '@/types/entities.ts';

export interface List {
  next: string | null;
  items: string[];
  isLoading: boolean;
}

export interface Reaction {
  accounts: string[];
  count: number;
  name: string;
  url: string | null;
}

interface ReactionList {
  next: string | null;
  items: Reaction[];
  isLoading: boolean;
}

export interface ParticipationRequest {
  account: string;
  participation_message: string | null;
}

interface ParticipationRequestList {
  next: string | null;
  items: ParticipationRequest[];
  isLoading: boolean;
}

interface State {
  followers: Record<string, List>;
  following: Record<string, List>;
  reblogged_by: Record<string, List>;
  favourited_by: Record<string, List>;
  disliked_by: Record<string, List>;
  reactions: Record<string, ReactionList>;
  follow_requests: List;
  blocks: List;
  mutes: List;
  directory: List;
  pinned: Record<string, List>;
  birthday_reminders: Record<string, List>;
  familiar_followers: Record<string, List>;
  event_participations: Record<string, List>;
  event_participation_requests: Record<string, ParticipationRequestList>;
  membership_requests: Record<string, List>;
  group_blocks: Record<string, List>;
}

export const newList = (list: Partial<List> = {}): List => ({
  next: null,
  items: [],
  isLoading: false,
  ...list,
});

export const initialState: State = {
  followers: {},
  following: {},
  reblogged_by: {},
  favourited_by: {},
  disliked_by: {},
  reactions: {},
  follow_requests: newList(),
  blocks: newList(),
  mutes: newList(),
  directory: newList({ isLoading: true }),
  pinned: {},
  birthday_reminders: {},
  familiar_followers: {},
  event_participations: {},
  event_participation_requests: {},
  membership_requests: {},
  group_blocks: {},
};

type NestedListKey = 'followers' | 'following' | 'reblogged_by' | 'favourited_by' | 'disliked_by' | 'pinned' | 'birthday_reminders' | 'familiar_followers' | 'event_participations' | 'membership_requests' | 'group_blocks';
type ListKey = 'follow_requests' | 'blocks' | 'mutes' | 'directory';
type NestedListPath = [NestedListKey, string];
type ListPath = [ListKey];

/** Get a list from the draft, creating it if it doesn't exist. */
const getList = (draft: Draft<State>, path: NestedListPath | ListPath): Draft<List> => {
  if (path.length === 1) {
    return draft[path[0]];
  }

  const [key, id] = path;
  draft[key][id] ??= newList();
  return draft[key][id];
};

const updateList = (state: State, path: NestedListPath | ListPath, recipe: (list: Draft<List>) => void): State => {
  return produce(state, draft => {
    recipe(getList(draft, path));
  });
};

const normalizeList = (state: State, path: NestedListPath | ListPath, accounts: APIEntity[], next?: string | null) => {
  return produce(state, draft => {
    const list = newList({
      next: next ?? null,
      items: [...new Set(accounts.map(item => item.id as string))],
    });

    if (path.length === 1) {
      draft[path[0]] = list;
    } else {
      draft[path[0]][path[1]] = list;
    }
  });
};

const appendToList = (state: State, path: NestedListPath | ListPath, accounts: APIEntity[], next: string | null) => {
  return updateList(state, path, list => {
    list.next = next;
    list.isLoading = false;
    list.items = [...new Set([...list.items, ...accounts.map(item => item.id as string)])];
  });
};

const removeFromList = (state: State, path: NestedListPath | ListPath, accountId: string) => {
  return updateList(state, path, list => {
    list.items = list.items.filter(item => item !== accountId);
  });
};

const setLoading = (state: State, path: NestedListPath | ListPath, isLoading: boolean) => {
  return updateList(state, path, list => {
    list.isLoading = isLoading;
  });
};

const normalizeFollowRequest = (state: State, notification: APIEntity) => {
  return updateList(state, ['follow_requests'], list => {
    list.items = [...new Set([notification.account.id as string, ...list.items])];
  });
};

const toParticipationRequest = ({ account, participation_message }: APIEntity): ParticipationRequest => ({
  account: account.id,
  participation_message: participation_message ?? null,
});

/** Merge participation requests, dropping exact duplicates. */
const mergeParticipationRequests = (items: ParticipationRequest[], newItems: ParticipationRequest[]): ParticipationRequest[] => {
  const result = [...items];

  newItems.forEach(item => {
    if (!result.some(({ account, participation_message }) => account === item.account && participation_message === item.participation_message)) {
      result.push(item);
    }
  });

  return result;
};

export default function userLists(state: State = initialState, action: AnyAction): State {
  switch (action.type) {
    case FOLLOWERS_FETCH_SUCCESS:
      return normalizeList(state, ['followers', action.id], action.accounts, action.next);
    case FOLLOWERS_EXPAND_SUCCESS:
      return appendToList(state, ['followers', action.id], action.accounts, action.next);
    case FOLLOWING_FETCH_SUCCESS:
      return normalizeList(state, ['following', action.id], action.accounts, action.next);
    case FOLLOWING_EXPAND_SUCCESS:
      return appendToList(state, ['following', action.id], action.accounts, action.next);
    case REBLOGS_FETCH_SUCCESS:
      return normalizeList(state, ['reblogged_by', action.id], action.accounts, action.next);
    case REBLOGS_EXPAND_SUCCESS:
      return appendToList(state, ['reblogged_by', action.id], action.accounts, action.next);
    case FAVOURITES_FETCH_SUCCESS:
      return normalizeList(state, ['favourited_by', action.id], action.accounts, action.next);
    case FAVOURITES_EXPAND_SUCCESS:
      return appendToList(state, ['favourited_by', action.id], action.accounts, action.next);
    case DISLIKES_FETCH_SUCCESS:
      return normalizeList(state, ['disliked_by', action.id], action.accounts);
    case REACTIONS_FETCH_SUCCESS:
      return produce(state, draft => {
        draft.reactions[action.id] = {
          next: null,
          isLoading: false,
          items: action.reactions.map(({ accounts, count, name, url }: APIEntity): Reaction => ({
            accounts: [...new Set<string>(accounts.map((account: APIEntity) => account.id))],
            count: count ?? 0,
            name: name ?? '',
            url: url ?? null,
          })),
        };
      });
    case NOTIFICATIONS_UPDATE:
      return action.notification.type === 'follow_request' ? normalizeFollowRequest(state, action.notification) : state;
    case FOLLOW_REQUESTS_FETCH_SUCCESS:
      return normalizeList(state, ['follow_requests'], action.accounts, action.next);
    case FOLLOW_REQUESTS_EXPAND_SUCCESS:
      return appendToList(state, ['follow_requests'], action.accounts, action.next);
    case FOLLOW_REQUEST_AUTHORIZE_SUCCESS:
    case FOLLOW_REQUEST_REJECT_SUCCESS:
      return removeFromList(state, ['follow_requests'], action.id);
    case BLOCKS_FETCH_SUCCESS:
      return normalizeList(state, ['blocks'], action.accounts, action.next);
    case BLOCKS_EXPAND_SUCCESS:
      return appendToList(state, ['blocks'], action.accounts, action.next);
    case DIRECTORY_FETCH_SUCCESS:
      return normalizeList(state, ['directory'], action.accounts, action.next);
    case DIRECTORY_EXPAND_SUCCESS:
      return appendToList(state, ['directory'], action.accounts, action.next);
    case DIRECTORY_FETCH_REQUEST:
    case DIRECTORY_EXPAND_REQUEST:
      return setLoading(state, ['directory'], true);
    case DIRECTORY_FETCH_FAIL:
    case DIRECTORY_EXPAND_FAIL:
      return setLoading(state, ['directory'], false);
    case PINNED_ACCOUNTS_FETCH_SUCCESS:
      return normalizeList(state, ['pinned', action.id], action.accounts, action.next);
    case BIRTHDAY_REMINDERS_FETCH_SUCCESS:
      return normalizeList(state, ['birthday_reminders', action.id], action.accounts, action.next);
    case FAMILIAR_FOLLOWERS_FETCH_SUCCESS:
      return normalizeList(state, ['familiar_followers', action.id], action.accounts, action.next);
    case EVENT_PARTICIPATIONS_FETCH_SUCCESS:
      return normalizeList(state, ['event_participations', action.id], action.accounts, action.next);
    case EVENT_PARTICIPATIONS_EXPAND_SUCCESS:
      return appendToList(state, ['event_participations', action.id], action.accounts, action.next);
    case EVENT_PARTICIPATION_REQUESTS_FETCH_SUCCESS:
      return produce(state, draft => {
        draft.event_participation_requests[action.id] = {
          next: action.next,
          isLoading: false,
          items: mergeParticipationRequests([], action.participations.map(toParticipationRequest)),
        };
      });
    case EVENT_PARTICIPATION_REQUESTS_EXPAND_SUCCESS:
      return produce(state, draft => {
        const list = draft.event_participation_requests[action.id];
        if (list) {
          list.items = mergeParticipationRequests(list.items, action.participations.map(toParticipationRequest));
        }
      });
    case EVENT_PARTICIPATION_REQUEST_AUTHORIZE_SUCCESS:
    case EVENT_PARTICIPATION_REQUEST_REJECT_SUCCESS:
      return produce(state, draft => {
        const list = draft.event_participation_requests[action.id];
        if (list) {
          list.items = list.items.filter(({ account }) => account !== action.accountId);
        }
      });
    case GROUP_MEMBERSHIP_REQUESTS_FETCH_SUCCESS:
      return normalizeList(state, ['membership_requests', action.id], action.accounts, action.next);
    case GROUP_MEMBERSHIP_REQUESTS_EXPAND_SUCCESS:
      return appendToList(state, ['membership_requests', action.id], action.accounts, action.next);
    case GROUP_MEMBERSHIP_REQUESTS_FETCH_REQUEST:
    case GROUP_MEMBERSHIP_REQUESTS_EXPAND_REQUEST:
      return setLoading(state, ['membership_requests', action.id], true);
    case GROUP_MEMBERSHIP_REQUESTS_FETCH_FAIL:
    case GROUP_MEMBERSHIP_REQUESTS_EXPAND_FAIL:
      return setLoading(state, ['membership_requests', action.id], false);
    case GROUP_MEMBERSHIP_REQUEST_AUTHORIZE_SUCCESS:
    case GROUP_MEMBERSHIP_REQUEST_REJECT_SUCCESS:
      return removeFromList(state, ['membership_requests', action.groupId], action.accountId);
    case GROUP_BLOCKS_FETCH_SUCCESS:
      return normalizeList(state, ['group_blocks', action.id], action.accounts, action.next);
    case GROUP_BLOCKS_EXPAND_SUCCESS:
      return appendToList(state, ['group_blocks', action.id], action.accounts, action.next);
    case GROUP_BLOCKS_FETCH_REQUEST:
    case GROUP_BLOCKS_EXPAND_REQUEST:
      return setLoading(state, ['group_blocks', action.id], true);
    case GROUP_BLOCKS_FETCH_FAIL:
    case GROUP_BLOCKS_EXPAND_FAIL:
      return setLoading(state, ['group_blocks', action.id], false);
    case GROUP_UNBLOCK_SUCCESS:
      return removeFromList(state, ['group_blocks', action.groupId], action.accountId);
    default:
      return state;
  }
}
