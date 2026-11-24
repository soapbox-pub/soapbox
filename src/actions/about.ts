import DOMPurify from 'isomorphic-dompurify';

import api from '../api/index.ts';

import type { RootState } from '@/store.ts';
import type { AnyAction } from 'redux';

const FETCH_ABOUT_PAGE_REQUEST = 'FETCH_ABOUT_PAGE_REQUEST';
const FETCH_ABOUT_PAGE_SUCCESS = 'FETCH_ABOUT_PAGE_SUCCESS';
const FETCH_ABOUT_PAGE_FAIL = 'FETCH_ABOUT_PAGE_FAIL';

/**
 * Page slugs and locales come from the URL, so only allow plain names.
 * Anything else (`..`, `\`, `/`) could point the request at another file on the server.
 */
const SAFE_NAME = /^[a-z0-9_-]+$/i;

const fetchAboutPage = (slug = 'index', locale?: string) => (dispatch: React.Dispatch<AnyAction>, getState: () => RootState) => {
  dispatch({ type: FETCH_ABOUT_PAGE_REQUEST, slug, locale });

  if (!SAFE_NAME.test(slug) || (locale && !SAFE_NAME.test(locale))) {
    const error = new Error('Invalid about page');
    dispatch({ type: FETCH_ABOUT_PAGE_FAIL, slug, locale, error });
    return Promise.reject(error);
  }

  const filename = `${slug}${locale ? `.${locale}` : ''}.html`;
  return api(getState).get(`/instance/about/${filename}`)
    .then((response) => response.text())
    // The page is rendered as HTML, so sanitize it even though it comes from the server.
    .then((html) => DOMPurify.sanitize(html, { USE_PROFILES: { html: true } }))
    .then((html) => {
      dispatch({ type: FETCH_ABOUT_PAGE_SUCCESS, slug, locale, html });
      return html;
    })
    .catch(error => {
      dispatch({ type: FETCH_ABOUT_PAGE_FAIL, slug, locale, error });
      throw error;
    });
};

export {
  fetchAboutPage,
  FETCH_ABOUT_PAGE_REQUEST,
  FETCH_ABOUT_PAGE_SUCCESS,
  FETCH_ABOUT_PAGE_FAIL,
};
