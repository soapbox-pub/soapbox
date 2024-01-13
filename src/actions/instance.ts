import { createAsyncThunk } from '@reduxjs/toolkit';
import get from 'lodash/get';
import { gte } from 'semver';

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

interface InstanceData {
  instance: Record<string, any>;
  host: string | null | undefined;
}

export const fetchInstance = createAsyncThunk<InstanceData, InstanceData['host'], { state: RootState }>(
  'instance/fetch',
  async(host, { dispatch, getState, rejectWithValue }) => {
    try {
      const { data: instance } = await api(getState).get('/api/v1/instance');

      if (supportsInstanceV2(instance)) {
        dispatch(fetchInstanceV2(host));
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

export const fetchInstanceV2 = createAsyncThunk<InstanceData, InstanceData['host'], { state: RootState }>(
  'instanceV2/fetch',
  async(host, { getState, rejectWithValue }) => {
    try {
      const { data: instance } = await api(getState).get('/api/v2/instance');
      return { instance, host };
    } catch (e) {
      return rejectWithValue(e);
    }
  },
);

export const fetchNodeinfo = createAsyncThunk<void, void, { state: RootState }>(
  'nodeinfo/fetch',
  async(_arg, { getState }) => await api(getState).get('/nodeinfo/2.1.json'),
);
