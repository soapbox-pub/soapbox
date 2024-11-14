import MockAdapter from 'axios-mock-adapter';
import LinkHeader from 'http-link-header';
import { vi } from 'vitest';

import type { AxiosInstance, AxiosResponse } from 'axios';

const api = await vi.importActual('../index') as Record<string, Function>;
let mocks: Array<Function> = [];

export const __stub = (func: (mock: MockAdapter) => void) => mocks.push(func);
export const __clear = (): Function[] => mocks = [];

const setupMock = (axios: AxiosInstance) => {
  const mock = new MockAdapter(axios, { onNoMatch: 'throwException' });
  mocks.map(func => func(mock));
};

export const getLinks = (response: AxiosResponse): LinkHeader => {
  return new LinkHeader(response.headers?.link);
};

export const getNextLink = (response: AxiosResponse) => {
  const nextLink = new LinkHeader(response.headers?.link);
  return nextLink.refs.find(link => link.rel === 'next')?.uri;
};

export const getPrevLink = (response: AxiosResponse) => {
  const prevLink = new LinkHeader(response.headers?.link);
  return prevLink.refs.find(link => link.rel === 'prev')?.uri;
};

export const baseClient = (...params: any[]) => {
  const axios = api.baseClient(...params);
  setupMock(axios);
  return axios;
};

export default (...params: any[]) => {
  const axios = api.default(...params);
  setupMock(axios);
  return axios;
};
