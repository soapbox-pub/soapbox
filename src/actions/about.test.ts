import MockAdapter from 'axios-mock-adapter';
import { describe, expect, it } from 'vitest';

import { staticClient } from 'soapbox/api/index.ts';
import { mockStore } from 'soapbox/jest/test-helpers.tsx';

import {
  FETCH_ABOUT_PAGE_REQUEST,
  FETCH_ABOUT_PAGE_SUCCESS,
  FETCH_ABOUT_PAGE_FAIL,
  fetchAboutPage,
} from './about.ts';

describe('fetchAboutPage()', () => {
  it('creates the expected actions on success', () => {

    const mock = new MockAdapter(staticClient);

    mock.onGet('/instance/about/index.html')
      .reply(200, '<h1>Hello world</h1>');

    const expectedActions = [
      { type: FETCH_ABOUT_PAGE_REQUEST, slug: 'index' },
      { type: FETCH_ABOUT_PAGE_SUCCESS, slug: 'index', html: '<h1>Hello world</h1>' },
    ];
    const store = mockStore({});

    return store.dispatch(fetchAboutPage()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('creates the expected actions on failure', () => {
    const expectedActions = [
      { type: FETCH_ABOUT_PAGE_REQUEST, slug: 'asdf' },
      { type: FETCH_ABOUT_PAGE_FAIL, slug: 'asdf', error: new Error('Request failed with status code 404') },
    ];
    const store = mockStore({});

    return store.dispatch(fetchAboutPage('asdf')).catch(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
