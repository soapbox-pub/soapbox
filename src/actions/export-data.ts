import { defineMessages } from 'react-intl';

import { MastodonResponse } from 'soapbox/api/MastodonResponse.ts';
import api from 'soapbox/api/index.ts';
import { normalizeAccount } from 'soapbox/normalizers/index.ts';
import toast from 'soapbox/toast.tsx';

import type { RootState } from 'soapbox/store.ts';

export const EXPORT_FOLLOWS_REQUEST = 'EXPORT_FOLLOWS_REQUEST';
export const EXPORT_FOLLOWS_SUCCESS = 'EXPORT_FOLLOWS_SUCCESS';
export const EXPORT_FOLLOWS_FAIL    = 'EXPORT_FOLLOWS_FAIL';

export const EXPORT_BLOCKS_REQUEST = 'EXPORT_BLOCKS_REQUEST';
export const EXPORT_BLOCKS_SUCCESS = 'EXPORT_BLOCKS_SUCCESS';
export const EXPORT_BLOCKS_FAIL    = 'EXPORT_BLOCKS_FAIL';

export const EXPORT_MUTES_REQUEST = 'EXPORT_MUTES_REQUEST';
export const EXPORT_MUTES_SUCCESS = 'EXPORT_MUTES_SUCCESS';
export const EXPORT_MUTES_FAIL    = 'EXPORT_MUTES_FAIL';

const messages = defineMessages({
  blocksSuccess: { id: 'export_data.success.blocks', defaultMessage: 'Blocks exported successfully' },
  followersSuccess: { id: 'export_data.success.followers', defaultMessage: 'Followers exported successfully' },
  mutesSuccess: { id: 'export_data.success.mutes', defaultMessage: 'Mutes exported successfully' },
});

type ExportDataActions = {
  type: typeof EXPORT_FOLLOWS_REQUEST
  | typeof EXPORT_FOLLOWS_SUCCESS
  | typeof EXPORT_FOLLOWS_FAIL
  | typeof EXPORT_BLOCKS_REQUEST
  | typeof EXPORT_BLOCKS_SUCCESS
  | typeof EXPORT_BLOCKS_FAIL
  | typeof EXPORT_MUTES_REQUEST
  | typeof EXPORT_MUTES_SUCCESS
  | typeof EXPORT_MUTES_FAIL;
  error?: any;
}

function fileExport(content: string, fileName: string) {
  const fileToDownload = document.createElement('a');

  fileToDownload.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(content));
  fileToDownload.setAttribute('download', fileName);
  fileToDownload.style.display = 'none';
  document.body.appendChild(fileToDownload);
  fileToDownload.click();
  document.body.removeChild(fileToDownload);
}

const listAccounts = (getState: () => RootState) => {
  return async(response: MastodonResponse) => {
    let { next } = response.pagination();
    const data = await response.json();

    const map = new Map<string, Record<string, any>>();

    for (const account of data) {
      map.set(account.id, account);
    }

    while (next) {
      const response = await api(getState).get(next);
      next = response.pagination().next;
      const data = await response.json();

      for (const account of data) {
        map.set(account.id, account);
      }
    }

    const accts = [...map.values()].map((account) => normalizeAccount(account).fqn);

    return accts;
  };
};

export const exportFollows = () => (dispatch: React.Dispatch<ExportDataActions>, getState: () => RootState) => {
  dispatch({ type: EXPORT_FOLLOWS_REQUEST });
  const me = getState().me;
  return api(getState)
    .get(`/api/v1/accounts/${me}/following?limit=40`)
    .then(listAccounts(getState))
    .then((followings) => {
      followings = followings.map(fqn => fqn + ',true');
      followings.unshift('Account address,Show boosts');
      fileExport(followings.join('\n'), 'export_followings.csv');

      toast.success(messages.followersSuccess);
      dispatch({ type: EXPORT_FOLLOWS_SUCCESS });
    }).catch(error => {
      dispatch({ type: EXPORT_FOLLOWS_FAIL, error });
    });
};

export const exportBlocks = () => (dispatch: React.Dispatch<ExportDataActions>, getState: () => RootState) => {
  dispatch({ type: EXPORT_BLOCKS_REQUEST });
  return api(getState)
    .get('/api/v1/blocks?limit=40')
    .then(listAccounts(getState))
    .then((blocks) => {
      fileExport(blocks.join('\n'), 'export_block.csv');

      toast.success(messages.blocksSuccess);
      dispatch({ type: EXPORT_BLOCKS_SUCCESS });
    }).catch(error => {
      dispatch({ type: EXPORT_BLOCKS_FAIL, error });
    });
};

export const exportMutes = () => (dispatch: React.Dispatch<ExportDataActions>, getState: () => RootState) => {
  dispatch({ type: EXPORT_MUTES_REQUEST });
  return api(getState)
    .get('/api/v1/mutes?limit=40')
    .then(listAccounts(getState))
    .then((mutes) => {
      fileExport(mutes.join('\n'), 'export_mutes.csv');

      toast.success(messages.mutesSuccess);
      dispatch({ type: EXPORT_MUTES_SUCCESS });
    }).catch(error => {
      dispatch({ type: EXPORT_MUTES_FAIL, error });
    });
};
