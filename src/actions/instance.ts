import { createAsyncThunk } from '@reduxjs/toolkit';
import get from 'lodash/get';
import { gte } from 'semver';

import KVStore from 'soapbox/storage/kv-store';
import { RootState } from 'soapbox/store';
import { getAuthUserUrl, getMeUrl } from 'soapbox/utils/auth';
import { MASTODON, parseVersion, PLEROMA, REBASED } from 'soapbox/utils/features';

import api from '../api';

/** Figure out the appropriate instance to fetch depending on the state */
export const getHost = (state: RootState) => {
  const accountUrl = getMeUrl(state) || getAuthUserUrl(state) as string;

  try {
    return new URL(accountUrl).host;
  } catch {
    return null;
  }
};

export const rememberInstance = createAsyncThunk(
  'instance/remember',
  async(host: string) => {
    const instance = await KVStore.getItemOrError(`instance:${host}`);

    return { instance, host };
  },
);

const supportsInstanceV2 = (instance: Record<string, any>): boolean => {
  const v = parseVersion(get(instance, 'version'));
  return (v.software === MASTODON && gte(v.compatVersion, '4.0.0')) ||
    (v.software === PLEROMA && v.build === REBASED && gte(v.version, '2.5.54'));
};

/** We may need to fetch nodeinfo on Pleroma < 2.1 */
const needsNodeinfo = (instance: Record<string, any>): boolean => {
  const v = parseVersion(get(instance, 'version'));
  return v.software === PLEROMA && !get(instance, ['pleroma', 'metadata']);
};

export const fetchInstance = createAsyncThunk<{ instance: Record<string, any>; host?: string | null }, string | null | undefined, { state: RootState }>(
  'instance/fetch',
  async(host, { dispatch, getState, rejectWithValue }) => {
    try {
      const { data: instance } = await api(getState).get('/api/v1/instance');

      if (supportsInstanceV2(instance)) {
        return dispatch(fetchInstanceV2(host)) as any as { instance: Record<string, any>; host?: string | null };
      }

      if (needsNodeinfo(instance)) {
        dispatch(fetchNodeinfo());
      }
      return { instance, host };
    } catch (e) {
      return rejectWithValue(e);
    }
  },
);

export const fetchInstanceV2 = createAsyncThunk<{ instance: Record<string, any>; host?: string | null }, string | null | undefined, { state: RootState }>(
  'instance/fetch',
  async(host, { getState, rejectWithValue }) => {
    try {
      const { data: instance } = await api(getState).get('/api/v2/instance');
      return { instance, host };
    } catch (e) {
      return rejectWithValue(e);
    }
  },
);

/** Tries to remember the instance from browser storage before fetching it */
export const loadInstance = createAsyncThunk<void, void, { state: RootState }>(
  'instance/load',
  async(_arg, { dispatch, getState }) => {
    const host = getHost(getState());
    const rememberedInstance = await dispatch(rememberInstance(host || ''));

    if (rememberedInstance.payload && supportsInstanceV2((rememberedInstance.payload as any).instance)) {
      await dispatch(fetchInstanceV2(host));
    } else {
      await dispatch(fetchInstance(host));
    }
  },
);

export const fetchNodeinfo = createAsyncThunk<void, void, { state: RootState }>(
  'nodeinfo/fetch',
  async(_arg, { getState }) => await api(getState).get('/nodeinfo/2.1.json'),
);
