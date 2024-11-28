import { get } from 'es-toolkit/compat';
import { Map as ImmutableMap } from 'immutable';

import { type Relationship, relationshipSchema } from 'soapbox/schemas/index.ts';

import { ACCOUNT_NOTE_SUBMIT_SUCCESS } from '../actions/account-notes.ts';
import {
  ACCOUNT_BLOCK_SUCCESS,
  ACCOUNT_UNBLOCK_SUCCESS,
  ACCOUNT_MUTE_SUCCESS,
  ACCOUNT_UNMUTE_SUCCESS,
  ACCOUNT_SUBSCRIBE_SUCCESS,
  ACCOUNT_UNSUBSCRIBE_SUCCESS,
  ACCOUNT_PIN_SUCCESS,
  ACCOUNT_UNPIN_SUCCESS,
  ACCOUNT_REMOVE_FROM_FOLLOWERS_SUCCESS,
  RELATIONSHIPS_FETCH_SUCCESS,
} from '../actions/accounts.ts';
import {
  DOMAIN_BLOCK_SUCCESS,
  DOMAIN_UNBLOCK_SUCCESS,
} from '../actions/domain-blocks.ts';
import {
  ACCOUNT_IMPORT,
  ACCOUNTS_IMPORT,
} from '../actions/importer/index.ts';

import type { AnyAction } from 'redux';
import type { APIEntity } from 'soapbox/types/entities.ts';

type State = ImmutableMap<string, Relationship>;
type APIEntities = Array<APIEntity>;

const normalizeRelationships = (state: State, relationships: APIEntities) => {
  relationships.forEach(relationship => {
    try {
      state = state.set(relationship.id, relationshipSchema.parse(relationship));
    } catch (_e) {
      // do nothing
    }
  });

  return state;
};

const setDomainBlocking = (state: State, accounts: string[], blocking: boolean) => {
  return state.withMutations(map => {
    accounts.forEach(id => {
      map.setIn([id, 'domain_blocking'], blocking);
    });
  });
};

const importPleromaAccount = (state: State, account: APIEntity) => {
  const relationship = get(account, ['pleroma', 'relationship'], {});
  if (relationship.id)
    return normalizeRelationships(state, [relationship]);
  return state;
};

const importPleromaAccounts = (state: State, accounts: APIEntities) => {
  accounts.forEach(account => {
    state = importPleromaAccount(state, account);
  });

  return state;
};

export default function relationships(state: State = ImmutableMap<string, Relationship>(), action: AnyAction) {
  switch (action.type) {
    case ACCOUNT_IMPORT:
      return importPleromaAccount(state, action.account);
    case ACCOUNTS_IMPORT:
      return importPleromaAccounts(state, action.accounts);
    case ACCOUNT_BLOCK_SUCCESS:
    case ACCOUNT_UNBLOCK_SUCCESS:
    case ACCOUNT_MUTE_SUCCESS:
    case ACCOUNT_UNMUTE_SUCCESS:
    case ACCOUNT_SUBSCRIBE_SUCCESS:
    case ACCOUNT_UNSUBSCRIBE_SUCCESS:
    case ACCOUNT_PIN_SUCCESS:
    case ACCOUNT_UNPIN_SUCCESS:
    case ACCOUNT_NOTE_SUBMIT_SUCCESS:
    case ACCOUNT_REMOVE_FROM_FOLLOWERS_SUCCESS:
      return normalizeRelationships(state, [action.relationship]);
    case RELATIONSHIPS_FETCH_SUCCESS:
      return normalizeRelationships(state, action.relationships);
    case DOMAIN_BLOCK_SUCCESS:
      return setDomainBlocking(state, action.accounts, true);
    case DOMAIN_UNBLOCK_SUCCESS:
      return setDomainBlocking(state, action.accounts, false);
    default:
      return state;
  }
}
