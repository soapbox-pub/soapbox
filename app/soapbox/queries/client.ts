
import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';

import * as BuildConfig from 'soapbox/build_config';
import { STORAGE_KEY } from 'soapbox/reducers/auth';
import { isURL, parseBaseURL } from 'soapbox/utils/auth';

const cachedAuth = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
const token = cachedAuth.users[cachedAuth.me].access_token;
const baseURL = parseBaseURL(cachedAuth.users[cachedAuth.me].url);

const maybeParseJSON = (data: string) => {
  try {
    return JSON.parse(data);
  } catch (Exception) {
    return data;
  }
};

const API = axios.create({
  // When BACKEND_URL is set, always use it.
  baseURL: isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : baseURL,
  headers: Object.assign(token ? {
    'Authorization': `Bearer ${token}`,
  } : {}),

  transformResponse: [maybeParseJSON],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minute
      cacheTime: Infinity,
    },
  },
});

export { API, queryClient };
