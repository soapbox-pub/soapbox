import { getSettings, changeSetting } from '@/actions/settings.ts';

import type { AppDispatch, RootState } from '@/store.ts';

const getPinnedHosts = (state: RootState) => {
  const settings = getSettings(state);
  return settings.remote_timeline.pinnedHosts;
};

const pinHost = (host: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const pinnedHosts = getPinnedHosts(state);

    return dispatch(changeSetting(['remote_timeline', 'pinnedHosts'], [...new Set([...pinnedHosts, host])]));
  };

const unpinHost = (host: string) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    const state = getState();
    const pinnedHosts = getPinnedHosts(state);

    return dispatch(changeSetting(['remote_timeline', 'pinnedHosts'], pinnedHosts.filter(pinnedHost => pinnedHost !== host)));
  };

export {
  pinHost,
  unpinHost,
};
