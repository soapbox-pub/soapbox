import { Map as ImmutableMap, OrderedSet as ImmutableOrderedSet } from 'immutable';

import { mockStore, rootState } from 'soapbox/jest/test-helpers';
import { InstanceRecord } from 'soapbox/normalizers';
import { ReducerCompose } from 'soapbox/reducers/compose';

import { uploadCompose, submitCompose } from '../compose';
import { STATUS_CREATE_REQUEST } from '../statuses';

import type { IntlShape } from 'react-intl';

describe('uploadCompose()', () => {
  describe('with images', () => {
    let files: FileList, store: ReturnType<typeof mockStore>;

    beforeEach(() => {
      const instance = InstanceRecord({
        configuration: ImmutableMap({
          statuses: ImmutableMap({
            max_media_attachments: 4,
          }),
          media_attachments: ImmutableMap({
            image_size_limit: 10,
          }),
        }),
      });

      const state = rootState
        .set('me', '1234')
        .set('instance', instance)
        .setIn(['compose', 'home'], ReducerCompose());

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
        formatMessage: jest.fn().mockReturnValue('Image exceeds the current file size limit (10 Bytes)'),
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
      const instance = InstanceRecord({
        configuration: ImmutableMap({
          statuses: ImmutableMap({
            max_media_attachments: 4,
          }),
          media_attachments: ImmutableMap({
            video_size_limit: 10,
          }),
        }),
      });

      const state = rootState
        .set('me', '1234')
        .set('instance', instance)
        .setIn(['compose', 'home'], ReducerCompose());

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
        formatMessage: jest.fn().mockReturnValue('Video exceeds the current file size limit (10 Bytes)'),
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
    const state = rootState
      .set('me', '123')
      .setIn(['compose', 'home'], ReducerCompose({ text: '@alex hello @mkljczk@pl.fediverse.pl @gg@汉语/漢語.com alex@alexgleason.me' }));

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
