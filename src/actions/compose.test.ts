import { OrderedSet as ImmutableOrderedSet } from 'immutable';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { buildInstance } from 'soapbox/jest/factory.ts';
import { mockStore, rootState } from 'soapbox/jest/test-helpers.tsx';
import { ReducerCompose } from 'soapbox/reducers/compose.ts';

import { uploadCompose, submitCompose } from './compose.ts';
import { STATUS_CREATE_REQUEST } from './statuses.ts';

import type { IntlShape } from 'react-intl';

describe('uploadCompose()', () => {
  describe('with images', () => {
    let files: FileList, store: ReturnType<typeof mockStore>;

    beforeEach(() => {
      const instance = buildInstance({
        configuration: {
          statuses: {
            max_media_attachments: 4,
          },
          media_attachments: {
            image_size_limit: 10,
          },
        },
      });

      const state = {
        ...rootState,
        me: '1234',
        instance,
        compose: rootState.compose.set('home', ReducerCompose()),
      };

      store = mockStore(state);
      files = [{
        uri: 'image.png',
        name: 'Image',
        size: 15,
        type: 'image/png',
      }] as unknown as FileList;
    });

    it('creates an alert if exceeds max size', async() => {
      const mockIntl = {
        formatMessage: vi.fn().mockReturnValue('Image exceeds the current file size limit (10 Bytes)'),
      } as unknown as IntlShape;

      const expectedActions = [
        { type: 'COMPOSE_UPLOAD_REQUEST', id: 'home', skipLoading: true },
        { type: 'COMPOSE_UPLOAD_FAIL', id: 'home', error: true, skipLoading: true },
      ];

      await store.dispatch(uploadCompose('home', files, mockIntl));
      const actions = store.getActions();

      expect(actions).toEqual(expectedActions);
    });
  });

  describe('with videos', () => {
    let files: FileList, store: ReturnType<typeof mockStore>;

    beforeEach(() => {
      const instance = buildInstance({
        configuration: {
          statuses: {
            max_media_attachments: 4,
          },
          media_attachments: {
            video_size_limit: 10,
          },
        },
      });

      const state = {
        ...rootState,
        me: '1234',
        instance,
        compose: rootState.compose.set('home', ReducerCompose()),
      };

      store = mockStore(state);
      files = [{
        uri: 'video.mp4',
        name: 'Video',
        size: 15,
        type: 'video/mp4',
      }] as unknown as FileList;
    });

    it('creates an alert if exceeds max size', async() => {
      const mockIntl = {
        formatMessage: vi.fn().mockReturnValue('Video exceeds the current file size limit (10 Bytes)'),
      } as unknown as IntlShape;

      const expectedActions = [
        { type: 'COMPOSE_UPLOAD_REQUEST', id: 'home', skipLoading: true },
        { type: 'COMPOSE_UPLOAD_FAIL', id: 'home', error: true, skipLoading: true },
      ];

      await store.dispatch(uploadCompose('home', files, mockIntl));
      const actions = store.getActions();

      expect(actions).toEqual(expectedActions);
    });
  });
});

describe('submitCompose()', () => {
  it('inserts mentions from text', async() => {
    const state = {
      ...rootState,
      me: '1234',
      compose: rootState.compose.set('home', ReducerCompose({ text: '@alex hello @mkljczk@pl.fediverse.pl @gg@汉语/漢語.com alex@alexgleason.me' })),
    };

    const store = mockStore(state);
    await store.dispatch(submitCompose('home'));
    const actions = store.getActions();

    const statusCreateRequest = actions.find(action => action.type === STATUS_CREATE_REQUEST);
    const to = statusCreateRequest!.params.to as ImmutableOrderedSet<string>;

    const expected = [
      'alex',
      'mkljczk@pl.fediverse.pl',
      'gg@汉语/漢語.com',
    ];

    expect(to.toJS()).toEqual(expected);
  });
});
