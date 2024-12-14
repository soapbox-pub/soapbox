import { Entities } from 'soapbox/entity-store/entities.ts';
import { isLoggedIn } from 'soapbox/utils/auth.ts';

import api from '../api/index.ts';

import type { EntityStore } from 'soapbox/entity-store/types.ts';
import type { Account } from 'soapbox/schemas/index.ts';
import type { AppDispatch, RootState } from 'soapbox/store.ts';

const DOMAIN_BLOCK_REQUEST = 'DOMAIN_BLOCK_REQUEST';
const DOMAIN_BLOCK_SUCCESS = 'DOMAIN_BLOCK_SUCCESS';
const DOMAIN_BLOCK_FAIL    = 'DOMAIN_BLOCK_FAIL';

const DOMAIN_UNBLOCK_REQUEST = 'DOMAIN_UNBLOCK_REQUEST';
const DOMAIN_UNBLOCK_SUCCESS = 'DOMAIN_UNBLOCK_SUCCESS';
const DOMAIN_UNBLOCK_FAIL    = 'DOMAIN_UNBLOCK_FAIL';

const DOMAIN_BLOCKS_FETCH_REQUEST = 'DOMAIN_BLOCKS_FETCH_REQUEST';
const DOMAIN_BLOCKS_FETCH_SUCCESS = 'DOMAIN_BLOCKS_FETCH_SUCCESS';
const DOMAIN_BLOCKS_FETCH_FAIL    = 'DOMAIN_BLOCKS_FETCH_FAIL';

const DOMAIN_BLOCKS_EXPAND_REQUEST = 'DOMAIN_BLOCKS_EXPAND_REQUEST';
const DOMAIN_BLOCKS_EXPAND_SUCCESS = 'DOMAIN_BLOCKS_EXPAND_SUCCESS';
const DOMAIN_BLOCKS_EXPAND_FAIL    = 'DOMAIN_BLOCKS_EXPAND_FAIL';

const blockDomain = (domain: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(blockDomainRequest(domain));

    api(getState).post('/api/v1/domain_blocks', { domain }).then(() => {
      const accounts = selectAccountsByDomain(getState(), domain);
      if (!accounts) return;
      dispatch(blockDomainSuccess(domain, accounts));
    }).catch(err => {
      dispatch(blockDomainFail(domain, err));
    });
  };

const blockDomainRequest = (domain: string) => ({
  type: DOMAIN_BLOCK_REQUEST,
  domain,
});

const blockDomainSuccess = (domain: string, accounts: string[]) => ({
  type: DOMAIN_BLOCK_SUCCESS,
  domain,
  accounts,
});

const blockDomainFail = (domain: string, error: unknown) => ({
  type: DOMAIN_BLOCK_FAIL,
  domain,
  error,
});

const unblockDomain = (domain: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(unblockDomainRequest(domain));

    const data = new FormData();
    data.append('domain', domain);

    api(getState).request('DELETE', '/api/v1/domain_blocks', data).then(() => {
      const accounts = selectAccountsByDomain(getState(), domain);
      if (!accounts) return;
      dispatch(unblockDomainSuccess(domain, accounts));
    }).catch(err => {
      dispatch(unblockDomainFail(domain, err));
    });
  };

const unblockDomainRequest = (domain: string) => ({
  type: DOMAIN_UNBLOCK_REQUEST,
  domain,
});

const unblockDomainSuccess = (domain: string, accounts: string[]) => ({
  type: DOMAIN_UNBLOCK_SUCCESS,
  domain,
  accounts,
});

const unblockDomainFail = (domain: string, error: unknown) => ({
  type: DOMAIN_UNBLOCK_FAIL,
  domain,
  error,
});

const fetchDomainBlocks = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(fetchDomainBlocksRequest());

    api(getState).get('/api/v1/domain_blocks').then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(fetchDomainBlocksSuccess(data, next));
    }).catch(err => {
      dispatch(fetchDomainBlocksFail(err));
    });
  };

const fetchDomainBlocksRequest = () => ({
  type: DOMAIN_BLOCKS_FETCH_REQUEST,
});

const fetchDomainBlocksSuccess = (domains: string[], next: string | null) => ({
  type: DOMAIN_BLOCKS_FETCH_SUCCESS,
  domains,
  next,
});

const fetchDomainBlocksFail = (error: unknown) => ({
  type: DOMAIN_BLOCKS_FETCH_FAIL,
  error,
});

const expandDomainBlocks = () =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    const url = getState().domain_lists.blocks.next;

    if (!url) {
      return;
    }

    dispatch(expandDomainBlocksRequest());

    api(getState).get(url).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(expandDomainBlocksSuccess(data, next));
    }).catch(err => {
      dispatch(expandDomainBlocksFail(err));
    });
  };

function selectAccountsByDomain(state: RootState, domain: string): string[] {
  const store = state.entities[Entities.ACCOUNTS]?.store as EntityStore<Account> | undefined;
  const entries = store ? Object.entries(store) : undefined;
  const accounts = entries
    ?.filter(([_, item]) => item && item.acct.endsWith(`@${domain}`))
    .map(([_, item]) => item!.id);
  return accounts || [];
}

const expandDomainBlocksRequest = () => ({
  type: DOMAIN_BLOCKS_EXPAND_REQUEST,
});

const expandDomainBlocksSuccess = (domains: string[], next: string | null) => ({
  type: DOMAIN_BLOCKS_EXPAND_SUCCESS,
  domains,
  next,
});

const expandDomainBlocksFail = (error: unknown) => ({
  type: DOMAIN_BLOCKS_EXPAND_FAIL,
  error,
});

export {
  DOMAIN_BLOCK_REQUEST,
  DOMAIN_BLOCK_SUCCESS,
  DOMAIN_BLOCK_FAIL,
  DOMAIN_UNBLOCK_REQUEST,
  DOMAIN_UNBLOCK_SUCCESS,
  DOMAIN_UNBLOCK_FAIL,
  DOMAIN_BLOCKS_FETCH_REQUEST,
  DOMAIN_BLOCKS_FETCH_SUCCESS,
  DOMAIN_BLOCKS_FETCH_FAIL,
  DOMAIN_BLOCKS_EXPAND_REQUEST,
  DOMAIN_BLOCKS_EXPAND_SUCCESS,
  DOMAIN_BLOCKS_EXPAND_FAIL,
  blockDomain,
  blockDomainRequest,
  blockDomainSuccess,
  blockDomainFail,
  unblockDomain,
  unblockDomainRequest,
  unblockDomainSuccess,
  unblockDomainFail,
  fetchDomainBlocks,
  fetchDomainBlocksRequest,
  fetchDomainBlocksSuccess,
  fetchDomainBlocksFail,
  expandDomainBlocks,
  expandDomainBlocksRequest,
  expandDomainBlocksSuccess,
  expandDomainBlocksFail,
};
