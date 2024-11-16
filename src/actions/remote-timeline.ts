import { getSettings, changeSetting } from 'soapbox/actions/settings.ts';

import type { List as ImmutableList, OrderedSet as ImmutableOrderedSet } from 'immutable';
import type { AppDispatch, RootState } from 'soapbox/store.ts';

const getPinnedHosts = (state: RootState) => {
  const settings = getSettings(state);
  return settings.getIn(['remote_timeline', 'pinnedHosts']) as ImmutableList<string> | ImmutableOrderedSet<string>;
};

const pinHost = (host: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const pinnedHosts = getPinnedHosts(state);

    return dispatch(changeSetting(['remote_timeline', 'pinnedHosts'], pinnedHosts.toOrderedSet().add(host)));
  };

const unpinHost = (host: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const pinnedHosts = getPinnedHosts(state);

    return dispatch(changeSetting(['remote_timeline', 'pinnedHosts'], pinnedHosts.toOrderedSet().remove(host)));
  };

export {
  pinHost,
  unpinHost,
};
