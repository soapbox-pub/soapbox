/**
 * Accounts Meta: private user data only the owner should see.
 * @module soapbox/reducers/accounts_meta
 */

import { produce } from 'immer';

import { VERIFY_CREDENTIALS_SUCCESS, AUTH_ACCOUNT_REMEMBER_SUCCESS } from 'soapbox/actions/auth';
import { ME_FETCH_SUCCESS, ME_PATCH_SUCCESS } from 'soapbox/actions/me';
import { Account, accountSchema } from 'soapbox/schemas';

import type { AnyAction } from '@reduxjs/toolkit';

interface AccountMeta {
  pleroma: Account['pleroma'];
  source: Account['source'];
}

type State = Record<string, AccountMeta | undefined>;

function importAccount(state: State, data: unknown): State {
  const result = accountSchema.safeParse(data);

  if (!result.success) {
    return state;
  }

  const account = result.data;

  return produce(state, draft => {
    const existing = draft[account.id];

    draft[account.id] = {
      pleroma: account.pleroma ?? existing?.pleroma,
      source: account.source ?? existing?.source,
    };
  });
}

export default function accounts_meta(state: Readonly<State> = {}, action: AnyAction): State {
  switch (action.type) {
    case ME_FETCH_SUCCESS:
    case ME_PATCH_SUCCESS:
      return importAccount(state, action.me);
    case VERIFY_CREDENTIALS_SUCCESS:
    case AUTH_ACCOUNT_REMEMBER_SUCCESS:
      return importAccount(state, action.account);
    default:
      return state;
  }
}
