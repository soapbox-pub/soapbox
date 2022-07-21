import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import * as BuildConfig from 'soapbox/build_config';
import { STORAGE_KEY } from 'soapbox/reducers/auth';
import { getAccessToken, getAppToken, isURL, parseBaseURL } from 'soapbox/utils/auth';

import type { RootState } from 'soapbox/store';

const cachedAuth = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
const baseURL = parseBaseURL(cachedAuth.users[cachedAuth.me].url);

const getToken = (state: RootState, authType: string) => {
  return authType === 'app' ? getAppToken(state) : getAccessToken(state);
};

type CarouselAccount = {
  account_id: string
  account_avatar: string
  username: string
}

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'soapboxApi',
  baseQuery: fetchBaseQuery({
    baseUrl: isURL(BuildConfig.BACKEND_URL) ? BuildConfig.BACKEND_URL : baseURL,
    prepareHeaders: (headers, { getState }): Headers => {
      const state = getState() as RootState;
      const accessToken: string = getToken(state, 'user');

      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getCarouselAvatars: builder.query<CarouselAccount[], null>({
      query: () => '/api/v1/truth/carousels/avatars',
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetCarouselAvatarsQuery } = api;
