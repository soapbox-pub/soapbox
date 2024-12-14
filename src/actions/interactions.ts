import { defineMessages } from 'react-intl';

import toast from 'soapbox/toast.tsx';
import { isLoggedIn } from 'soapbox/utils/auth.ts';

import api from '../api/index.ts';

import { fetchRelationships } from './accounts.ts';
import { importFetchedAccounts, importFetchedStatus } from './importer/index.ts';
import { expandGroupFeaturedTimeline } from './timelines.ts';

import type { AppDispatch, RootState } from 'soapbox/store.ts';
import type { Account as AccountEntity, APIEntity, Group, Status as StatusEntity } from 'soapbox/types/entities.ts';

const REBLOG_REQUEST = 'REBLOG_REQUEST';
const REBLOG_SUCCESS = 'REBLOG_SUCCESS';
const REBLOG_FAIL    = 'REBLOG_FAIL';

const FAVOURITE_REQUEST = 'FAVOURITE_REQUEST';
const FAVOURITE_SUCCESS = 'FAVOURITE_SUCCESS';
const FAVOURITE_FAIL    = 'FAVOURITE_FAIL';

const DISLIKE_REQUEST = 'DISLIKE_REQUEST';
const DISLIKE_SUCCESS = 'DISLIKE_SUCCESS';
const DISLIKE_FAIL    = 'DISLIKE_FAIL';

const UNREBLOG_REQUEST = 'UNREBLOG_REQUEST';
const UNREBLOG_SUCCESS = 'UNREBLOG_SUCCESS';
const UNREBLOG_FAIL    = 'UNREBLOG_FAIL';

const UNFAVOURITE_REQUEST = 'UNFAVOURITE_REQUEST';
const UNFAVOURITE_SUCCESS = 'UNFAVOURITE_SUCCESS';
const UNFAVOURITE_FAIL    = 'UNFAVOURITE_FAIL';

const UNDISLIKE_REQUEST = 'UNDISLIKE_REQUEST';
const UNDISLIKE_SUCCESS = 'UNDISLIKE_SUCCESS';
const UNDISLIKE_FAIL    = 'UNDISLIKE_FAIL';

const REBLOGS_FETCH_REQUEST = 'REBLOGS_FETCH_REQUEST';
const REBLOGS_FETCH_SUCCESS = 'REBLOGS_FETCH_SUCCESS';
const REBLOGS_FETCH_FAIL    = 'REBLOGS_FETCH_FAIL';

const FAVOURITES_FETCH_REQUEST = 'FAVOURITES_FETCH_REQUEST';
const FAVOURITES_FETCH_SUCCESS = 'FAVOURITES_FETCH_SUCCESS';
const FAVOURITES_FETCH_FAIL    = 'FAVOURITES_FETCH_FAIL';

const DISLIKES_FETCH_REQUEST = 'DISLIKES_FETCH_REQUEST';
const DISLIKES_FETCH_SUCCESS = 'DISLIKES_FETCH_SUCCESS';
const DISLIKES_FETCH_FAIL    = 'DISLIKES_FETCH_FAIL';

const REACTIONS_FETCH_REQUEST = 'REACTIONS_FETCH_REQUEST';
const REACTIONS_FETCH_SUCCESS = 'REACTIONS_FETCH_SUCCESS';
const REACTIONS_FETCH_FAIL    = 'REACTIONS_FETCH_FAIL';

const PIN_REQUEST = 'PIN_REQUEST';
const PIN_SUCCESS = 'PIN_SUCCESS';
const PIN_FAIL    = 'PIN_FAIL';

const UNPIN_REQUEST = 'UNPIN_REQUEST';
const UNPIN_SUCCESS = 'UNPIN_SUCCESS';
const UNPIN_FAIL    = 'UNPIN_FAIL';

const BOOKMARK_REQUEST = 'BOOKMARK_REQUEST';
const BOOKMARK_SUCCESS = 'BOOKMARKED_SUCCESS';
const BOOKMARK_FAIL    = 'BOOKMARKED_FAIL';

const UNBOOKMARK_REQUEST = 'UNBOOKMARKED_REQUEST';
const UNBOOKMARK_SUCCESS = 'UNBOOKMARKED_SUCCESS';
const UNBOOKMARK_FAIL    = 'UNBOOKMARKED_FAIL';

const REMOTE_INTERACTION_REQUEST = 'REMOTE_INTERACTION_REQUEST';
const REMOTE_INTERACTION_SUCCESS = 'REMOTE_INTERACTION_SUCCESS';
const REMOTE_INTERACTION_FAIL    = 'REMOTE_INTERACTION_FAIL';

const FAVOURITES_EXPAND_SUCCESS = 'FAVOURITES_EXPAND_SUCCESS';
const FAVOURITES_EXPAND_FAIL = 'FAVOURITES_EXPAND_FAIL';

const REBLOGS_EXPAND_SUCCESS = 'REBLOGS_EXPAND_SUCCESS';
const REBLOGS_EXPAND_FAIL = 'REBLOGS_EXPAND_FAIL';

const ZAP_REQUEST = 'ZAP_REQUEST';
const ZAP_SUCCESS = 'ZAP_SUCCESS';
const ZAP_FAIL    = 'ZAP_FAIL';

const ZAPS_FETCH_REQUEST = 'ZAPS_FETCH_REQUEST';
const ZAPS_FETCH_SUCCESS = 'ZAPS_FETCH_SUCCESS';
const ZAPS_FETCH_FAIL    = 'ZAPS_FETCH_FAIL';

const ZAPS_EXPAND_SUCCESS = 'ZAPS_EXPAND_SUCCESS';
const ZAPS_EXPAND_FAIL = 'ZAPS_EXPAND_FAIL';

const messages = defineMessages({
  bookmarkAdded: { id: 'status.bookmarked', defaultMessage: 'Bookmark added.' },
  bookmarkRemoved: { id: 'status.unbookmarked', defaultMessage: 'Bookmark removed.' },
  view: { id: 'toast.view', defaultMessage: 'View' },
});

const reblog = (status: StatusEntity) =>
  function(dispatch: AppDispatch, getState: () => RootState) {
    if (!isLoggedIn(getState)) return;

    dispatch(reblogRequest(status));

    api(getState).post(`/api/v1/statuses/${status.id}/reblog`).then((response) => response.json()).then((data) => {
      // The reblog API method returns a new status wrapped around the original. In this case we are only
      // interested in how the original is modified, hence passing it skipping the wrapper
      dispatch(importFetchedStatus(data.reblog));
      dispatch(reblogSuccess(status));
    }).catch(error => {
      dispatch(reblogFail(status, error));
    });
  };

const unreblog = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(unreblogRequest(status));

    api(getState).post(`/api/v1/statuses/${status.id}/unreblog`).then(() => {
      dispatch(unreblogSuccess(status));
    }).catch(error => {
      dispatch(unreblogFail(status, error));
    });
  };

const toggleReblog = (status: StatusEntity) =>
  (dispatch: AppDispatch) => {
    if (status.reblogged) {
      dispatch(unreblog(status));
    } else {
      dispatch(reblog(status));
    }
  };

const reblogRequest = (status: StatusEntity) => ({
  type: REBLOG_REQUEST,
  status: status,
  skipLoading: true,
});

const reblogSuccess = (status: StatusEntity) => ({
  type: REBLOG_SUCCESS,
  status: status,
  skipLoading: true,
});

const reblogFail = (status: StatusEntity, error: unknown) => ({
  type: REBLOG_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const unreblogRequest = (status: StatusEntity) => ({
  type: UNREBLOG_REQUEST,
  status: status,
  skipLoading: true,
});

const unreblogSuccess = (status: StatusEntity) => ({
  type: UNREBLOG_SUCCESS,
  status: status,
  skipLoading: true,
});

const unreblogFail = (status: StatusEntity, error: unknown) => ({
  type: UNREBLOG_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const favourite = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(favouriteRequest(status));

    api(getState).post(`/api/v1/statuses/${status.id}/favourite`).then(function(response) {
      dispatch(favouriteSuccess(status));
    }).catch(function(error) {
      dispatch(favouriteFail(status, error));
    });
  };

const unfavourite = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(unfavouriteRequest(status));

    api(getState).post(`/api/v1/statuses/${status.id}/unfavourite`).then(() => {
      dispatch(unfavouriteSuccess(status));
    }).catch(error => {
      dispatch(unfavouriteFail(status, error));
    });
  };

const toggleFavourite = (status: StatusEntity) =>
  (dispatch: AppDispatch) => {
    if (status.favourited) {
      dispatch(unfavourite(status));
    } else {
      dispatch(favourite(status));
    }
  };

const favouriteRequest = (status: StatusEntity) => ({
  type: FAVOURITE_REQUEST,
  status: status,
  skipLoading: true,
});

const favouriteSuccess = (status: StatusEntity) => ({
  type: FAVOURITE_SUCCESS,
  status: status,
  skipLoading: true,
});

const favouriteFail = (status: StatusEntity, error: unknown) => ({
  type: FAVOURITE_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const unfavouriteRequest = (status: StatusEntity) => ({
  type: UNFAVOURITE_REQUEST,
  status: status,
  skipLoading: true,
});

const unfavouriteSuccess = (status: StatusEntity) => ({
  type: UNFAVOURITE_SUCCESS,
  status: status,
  skipLoading: true,
});

const unfavouriteFail = (status: StatusEntity, error: unknown) => ({
  type: UNFAVOURITE_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const dislike = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(dislikeRequest(status));

    api(getState).post(`/api/friendica/statuses/${status.id}/dislike`).then(function() {
      dispatch(dislikeSuccess(status));
    }).catch(function(error) {
      dispatch(dislikeFail(status, error));
    });
  };

const undislike = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(undislikeRequest(status));

    api(getState).post(`/api/friendica/statuses/${status.id}/undislike`).then(() => {
      dispatch(undislikeSuccess(status));
    }).catch(error => {
      dispatch(undislikeFail(status, error));
    });
  };

const toggleDislike = (status: StatusEntity) =>
  (dispatch: AppDispatch) => {
    if (status.disliked) {
      dispatch(undislike(status));
    } else {
      dispatch(dislike(status));
    }
  };

const dislikeRequest = (status: StatusEntity) => ({
  type: DISLIKE_REQUEST,
  status: status,
  skipLoading: true,
});

const dislikeSuccess = (status: StatusEntity) => ({
  type: DISLIKE_SUCCESS,
  status: status,
  skipLoading: true,
});

const dislikeFail = (status: StatusEntity, error: unknown) => ({
  type: DISLIKE_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const undislikeRequest = (status: StatusEntity) => ({
  type: UNDISLIKE_REQUEST,
  status: status,
  skipLoading: true,
});

const undislikeSuccess = (status: StatusEntity) => ({
  type: UNDISLIKE_SUCCESS,
  status: status,
  skipLoading: true,
});

const undislikeFail = (status: StatusEntity, error: unknown) => ({
  type: UNDISLIKE_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const zap = (account: AccountEntity, status: StatusEntity | undefined, amount: number, comment: string) => (dispatch: AppDispatch, getState: () => RootState) => {
  if (!isLoggedIn(getState)) return;

  if (status) dispatch(zapRequest(status));

  return api(getState).post('/api/v1/ditto/zap', { amount, comment, account_id: account.id, status_id: status?.id }).then(async (response) => {
    const { invoice } =  await response.json();
    if (!invoice) throw Error('Could not generate invoice');
    if (!window.webln) return invoice;

    try {
      await window.webln?.enable();
      await window.webln?.sendPayment(invoice);
      if (status) dispatch(zapSuccess(status));
      return undefined;
    } catch (e) { // In case it fails we just return the invoice so the QR code can be created
      return invoice;
    }
  }).catch(function(e) {
    if (status) dispatch(zapFail(status, e));
  });
};

const zapRequest = (status: StatusEntity) => ({
  type: ZAP_REQUEST,
  status: status,
  skipLoading: true,
});

const zapSuccess = (status: StatusEntity) => ({
  type: ZAP_SUCCESS,
  status: status,
  skipLoading: true,
});

const zapFail = (status: StatusEntity, error: unknown) => ({
  type: ZAP_FAIL,
  status: status,
  error: error,
  skipLoading: true,
});

const bookmark = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(bookmarkRequest(status));

    return api(getState).post(`/api/v1/statuses/${status.id}/bookmark`).then((response) => response.json()).then((data) => {
      dispatch(importFetchedStatus(data));
      dispatch(bookmarkSuccess(status, data));

      toast.success(messages.bookmarkAdded, {
        actionLink: '/bookmarks',
      });
    }).catch(function(error) {
      dispatch(bookmarkFail(status, error));
    });
  };

const unbookmark = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(unbookmarkRequest(status));

    api(getState).post(`/api/v1/statuses/${status.id}/unbookmark`).then((response) => response.json()).then((data) => {
      dispatch(importFetchedStatus(data));
      dispatch(unbookmarkSuccess(status, data));
      toast.success(messages.bookmarkRemoved);
    }).catch(error => {
      dispatch(unbookmarkFail(status, error));
    });
  };

const toggleBookmark = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (status.bookmarked) {
      dispatch(unbookmark(status));
    } else {
      dispatch(bookmark(status));
    }
  };

const bookmarkRequest = (status: StatusEntity) => ({
  type: BOOKMARK_REQUEST,
  status: status,
});

const bookmarkSuccess = (status: StatusEntity, response: APIEntity) => ({
  type: BOOKMARK_SUCCESS,
  status: status,
  response: response,
});

const bookmarkFail = (status: StatusEntity, error: unknown) => ({
  type: BOOKMARK_FAIL,
  status: status,
  error: error,
});

const unbookmarkRequest = (status: StatusEntity) => ({
  type: UNBOOKMARK_REQUEST,
  status: status,
});

const unbookmarkSuccess = (status: StatusEntity, response: APIEntity) => ({
  type: UNBOOKMARK_SUCCESS,
  status: status,
  response: response,
});

const unbookmarkFail = (status: StatusEntity, error: unknown) => ({
  type: UNBOOKMARK_FAIL,
  status: status,
  error,
});

const fetchReblogs = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(fetchReblogsRequest(id));

    api(getState).get(`/api/v1/statuses/${id}/reblogged_by`).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts(data));
      dispatch(fetchRelationships(data.map((item: APIEntity) => item.id)));
      dispatch(fetchReblogsSuccess(id, data, next));
    }).catch(error => {
      dispatch(fetchReblogsFail(id, error));
    });
  };

const fetchReblogsRequest = (id: string) => ({
  type: REBLOGS_FETCH_REQUEST,
  id,
});

const fetchReblogsSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: REBLOGS_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchReblogsFail = (id: string, error: unknown) => ({
  type: REBLOGS_FETCH_FAIL,
  id,
  error,
});

const expandReblogs = (id: string, path: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    api(getState).get(path).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts(data));
      dispatch(fetchRelationships(data.map((item: APIEntity) => item.id)));
      dispatch(expandReblogsSuccess(id, data, next));
    }).catch(error => {
      dispatch(expandReblogsFail(id, error));
    });
  };

const expandReblogsSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: REBLOGS_EXPAND_SUCCESS,
  id,
  accounts,
  next,
});

const expandReblogsFail = (id: string, error: unknown) => ({
  type: REBLOGS_EXPAND_FAIL,
  id,
  error,
});

const fetchFavourites = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(fetchFavouritesRequest(id));

    api(getState).get(`/api/v1/statuses/${id}/favourited_by`).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts(data));
      dispatch(fetchRelationships(data.map((item: APIEntity) => item.id)));
      dispatch(fetchFavouritesSuccess(id, data, next));
    }).catch(error => {
      dispatch(fetchFavouritesFail(id, error));
    });
  };

const fetchFavouritesRequest = (id: string) => ({
  type: FAVOURITES_FETCH_REQUEST,
  id,
});

const fetchFavouritesSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: FAVOURITES_FETCH_SUCCESS,
  id,
  accounts,
  next,
});

const fetchFavouritesFail = (id: string, error: unknown) => ({
  type: FAVOURITES_FETCH_FAIL,
  id,
  error,
});

const expandFavourites = (id: string, path: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    api(getState).get(path).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts(data));
      dispatch(fetchRelationships(data.map((item: APIEntity) => item.id)));
      dispatch(expandFavouritesSuccess(id, data, next));
    }).catch(error => {
      dispatch(expandFavouritesFail(id, error));
    });
  };

const expandFavouritesSuccess = (id: string, accounts: APIEntity[], next: string | null) => ({
  type: FAVOURITES_EXPAND_SUCCESS,
  id,
  accounts,
  next,
});

const expandFavouritesFail = (id: string, error: unknown) => ({
  type: FAVOURITES_EXPAND_FAIL,
  id,
  error,
});

const fetchDislikes = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(fetchDislikesRequest(id));

    api(getState).get(`/api/friendica/statuses/${id}/disliked_by`).then((response) => response.json()).then((data) => {
      dispatch(importFetchedAccounts(data));
      dispatch(fetchRelationships(data.map((item: APIEntity) => item.id)));
      dispatch(fetchDislikesSuccess(id, data));
    }).catch(error => {
      dispatch(fetchDislikesFail(id, error));
    });
  };

const fetchDislikesRequest = (id: string) => ({
  type: DISLIKES_FETCH_REQUEST,
  id,
});

const fetchDislikesSuccess = (id: string, accounts: APIEntity[]) => ({
  type: DISLIKES_FETCH_SUCCESS,
  id,
  accounts,
});

const fetchDislikesFail = (id: string, error: unknown) => ({
  type: DISLIKES_FETCH_FAIL,
  id,
  error,
});

const fetchReactions = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchReactionsRequest(id));

    api(getState).get(`/api/v1/pleroma/statuses/${id}/reactions`).then((response) => response.json()).then((data) => {
      dispatch(importFetchedAccounts((data as APIEntity[]).map(({ accounts }) => accounts).flat()));
      dispatch(fetchReactionsSuccess(id, data));
    }).catch(error => {
      dispatch(fetchReactionsFail(id, error));
    });
  };

const fetchReactionsRequest = (id: string) => ({
  type: REACTIONS_FETCH_REQUEST,
  id,
});

const fetchReactionsSuccess = (id: string, reactions: APIEntity[]) => ({
  type: REACTIONS_FETCH_SUCCESS,
  id,
  reactions,
});

const fetchReactionsFail = (id: string, error: unknown) => ({
  type: REACTIONS_FETCH_FAIL,
  id,
  error,
});

const fetchZaps = (id: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(fetchZapsRequest(id));

    api(getState).get(`/api/v1/ditto/statuses/${id}/zapped_by`).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts((data as APIEntity[]).map(({ account }) => account).flat()));
      dispatch(fetchZapsSuccess(id, data, next));
    }).catch(error => {
      dispatch(fetchZapsFail(id, error));
    });
  };

const fetchZapsRequest = (id: string) => ({
  type: ZAPS_FETCH_REQUEST,
  id,
});

const fetchZapsSuccess = (id: string, zaps: APIEntity[], next: string | null) => ({
  type: ZAPS_FETCH_SUCCESS,
  id,
  zaps,
  next,
});

const fetchZapsFail = (id: string, error: unknown) => ({
  type: REACTIONS_FETCH_FAIL,
  id,
  error,
});

const expandZaps = (id: string, path: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    api(getState).get(path).then(async (response) => {
      const next = response.next();
      const data = await response.json();
      dispatch(importFetchedAccounts(data.map((item: APIEntity) => item.account)));
      dispatch(fetchRelationships(data.map((item: APIEntity) => item.account.id)));
      dispatch(expandZapsSuccess(id, data, next));
    }).catch(error => {
      dispatch(expandZapsFail(id, error));
    });
  };

const expandZapsSuccess = (id: string, zaps: APIEntity[], next: string | null) => ({
  type: ZAPS_EXPAND_SUCCESS,
  id,
  zaps,
  next,
});

const expandZapsFail = (id: string, error: unknown) => ({
  type: ZAPS_EXPAND_FAIL,
  id,
  error,
});

const pin = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(pinRequest(status));

    api(getState).post(`/api/v1/statuses/${status.id}/pin`).then((response) => response.json()).then((data) => {
      dispatch(importFetchedStatus(data));
      dispatch(pinSuccess(status));
    }).catch(error => {
      dispatch(pinFail(status, error));
    });
  };

const pinToGroup = (status: StatusEntity, group: Group) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    return api(getState)
      .post(`/api/v1/groups/${group.id}/statuses/${status.id}/pin`)
      .then(() => dispatch(expandGroupFeaturedTimeline(group.id)));
  };

const unpinFromGroup = (status: StatusEntity, group: Group) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    return api(getState)
      .post(`/api/v1/groups/${group.id}/statuses/${status.id}/unpin`)
      .then(() => dispatch(expandGroupFeaturedTimeline(group.id)));
  };

const pinRequest = (status: StatusEntity) => ({
  type: PIN_REQUEST,
  status,
  skipLoading: true,
});

const pinSuccess = (status: StatusEntity) => ({
  type: PIN_SUCCESS,
  status,
  skipLoading: true,
});

const pinFail = (status: StatusEntity, error: unknown) => ({
  type: PIN_FAIL,
  status,
  error,
  skipLoading: true,
});

const unpin = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (!isLoggedIn(getState)) return;

    dispatch(unpinRequest(status));

    api(getState).post(`/api/v1/statuses/${status.id}/unpin`).then((response) => response.json()).then((data) => {
      dispatch(importFetchedStatus(data));
      dispatch(unpinSuccess(status));
    }).catch(error => {
      dispatch(unpinFail(status, error));
    });
  };

const togglePin = (status: StatusEntity) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    if (status.pinned) {
      dispatch(unpin(status));
    } else {
      dispatch(pin(status));
    }
  };

const unpinRequest = (status: StatusEntity) => ({
  type: UNPIN_REQUEST,
  status,
  skipLoading: true,
});

const unpinSuccess = (status: StatusEntity) => ({
  type: UNPIN_SUCCESS,
  status,
  skipLoading: true,
});

const unpinFail = (status: StatusEntity, error: unknown) => ({
  type: UNPIN_FAIL,
  status,
  error,
  skipLoading: true,
});

const remoteInteraction = (ap_id: string, profile: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(remoteInteractionRequest(ap_id, profile));

    return api(getState).post('/api/v1/pleroma/remote_interaction', { ap_id, profile }).then((response) => response.json()).then((data) => {
      if (data.error) throw new Error(data.error);

      dispatch(remoteInteractionSuccess(ap_id, profile, data.url));

      return data.url;
    }).catch(error => {
      dispatch(remoteInteractionFail(ap_id, profile, error));
      throw error;
    });
  };

const remoteInteractionRequest = (ap_id: string, profile: string) => ({
  type: REMOTE_INTERACTION_REQUEST,
  ap_id,
  profile,
});

const remoteInteractionSuccess = (ap_id: string, profile: string, url: string) => ({
  type: REMOTE_INTERACTION_SUCCESS,
  ap_id,
  profile,
  url,
});

const remoteInteractionFail = (ap_id: string, profile: string, error: unknown) => ({
  type: REMOTE_INTERACTION_FAIL,
  ap_id,
  profile,
  error,
});

export {
  REBLOG_REQUEST,
  REBLOG_SUCCESS,
  REBLOG_FAIL,
  FAVOURITE_REQUEST,
  FAVOURITE_SUCCESS,
  FAVOURITE_FAIL,
  DISLIKE_REQUEST,
  DISLIKE_SUCCESS,
  DISLIKE_FAIL,
  UNREBLOG_REQUEST,
  UNREBLOG_SUCCESS,
  UNREBLOG_FAIL,
  UNFAVOURITE_REQUEST,
  UNFAVOURITE_SUCCESS,
  UNFAVOURITE_FAIL,
  UNDISLIKE_REQUEST,
  UNDISLIKE_SUCCESS,
  UNDISLIKE_FAIL,
  REBLOGS_FETCH_REQUEST,
  REBLOGS_FETCH_SUCCESS,
  REBLOGS_FETCH_FAIL,
  FAVOURITES_FETCH_REQUEST,
  FAVOURITES_FETCH_SUCCESS,
  FAVOURITES_FETCH_FAIL,
  DISLIKES_FETCH_REQUEST,
  DISLIKES_FETCH_SUCCESS,
  DISLIKES_FETCH_FAIL,
  REACTIONS_FETCH_REQUEST,
  REACTIONS_FETCH_SUCCESS,
  REACTIONS_FETCH_FAIL,
  PIN_REQUEST,
  PIN_SUCCESS,
  PIN_FAIL,
  UNPIN_REQUEST,
  UNPIN_SUCCESS,
  UNPIN_FAIL,
  BOOKMARK_REQUEST,
  BOOKMARK_SUCCESS,
  BOOKMARK_FAIL,
  UNBOOKMARK_REQUEST,
  UNBOOKMARK_SUCCESS,
  UNBOOKMARK_FAIL,
  REMOTE_INTERACTION_REQUEST,
  REMOTE_INTERACTION_SUCCESS,
  REMOTE_INTERACTION_FAIL,
  FAVOURITES_EXPAND_SUCCESS,
  FAVOURITES_EXPAND_FAIL,
  REBLOGS_EXPAND_SUCCESS,
  REBLOGS_EXPAND_FAIL,
  ZAP_REQUEST,
  ZAP_FAIL,
  ZAPS_FETCH_REQUEST,
  ZAPS_FETCH_SUCCESS,
  ZAPS_FETCH_FAIL,
  ZAPS_EXPAND_SUCCESS,
  ZAPS_EXPAND_FAIL,
  reblog,
  unreblog,
  toggleReblog,
  reblogRequest,
  reblogSuccess,
  reblogFail,
  unreblogRequest,
  unreblogSuccess,
  unreblogFail,
  favourite,
  unfavourite,
  toggleFavourite,
  favouriteRequest,
  favouriteSuccess,
  favouriteFail,
  unfavouriteRequest,
  unfavouriteSuccess,
  unfavouriteFail,
  dislike,
  undislike,
  toggleDislike,
  dislikeRequest,
  dislikeSuccess,
  dislikeFail,
  undislikeRequest,
  undislikeSuccess,
  undislikeFail,
  bookmark,
  unbookmark,
  toggleBookmark,
  bookmarkRequest,
  bookmarkSuccess,
  bookmarkFail,
  unbookmarkRequest,
  unbookmarkSuccess,
  unbookmarkFail,
  fetchReblogs,
  fetchReblogsRequest,
  fetchReblogsSuccess,
  fetchReblogsFail,
  expandReblogs,
  fetchFavourites,
  fetchFavouritesRequest,
  fetchFavouritesSuccess,
  fetchFavouritesFail,
  expandFavourites,
  fetchDislikes,
  fetchDislikesRequest,
  fetchDislikesSuccess,
  fetchDislikesFail,
  fetchReactions,
  fetchReactionsRequest,
  fetchReactionsSuccess,
  fetchReactionsFail,
  pin,
  pinRequest,
  pinSuccess,
  pinFail,
  unpin,
  unpinRequest,
  unpinSuccess,
  unpinFail,
  togglePin,
  pinToGroup,
  unpinFromGroup,
  remoteInteraction,
  remoteInteractionRequest,
  remoteInteractionSuccess,
  remoteInteractionFail,
  zap,
  fetchZaps,
  expandZaps,
};
