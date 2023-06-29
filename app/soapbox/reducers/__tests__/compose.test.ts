import { List as ImmutableList, Record as ImmutableRecord, fromJS } from 'immutable';

import * as actions from 'soapbox/actions/compose';
import { ME_FETCH_SUCCESS, ME_PATCH_SUCCESS } from 'soapbox/actions/me';
import { SETTING_CHANGE } from 'soapbox/actions/settings';
import { TIMELINE_DELETE } from 'soapbox/actions/timelines';
import { TagRecord } from 'soapbox/normalizers';
import { normalizeStatus } from 'soapbox/normalizers/status';

import reducer, { initialState, ReducerCompose } from '../compose';

describe('compose reducer', () => {
  it('returns the initial state by default', () => {
    const state = reducer(undefined, {} as any);
    expect(state.toJS()).toMatchObject({
      default: {
        sensitive: false,
        spoiler: false,
        spoiler_text: '',
        privacy: 'public',
        text: '',
        focusDate: null,
        caretPosition: null,
        in_reply_to: null,
        is_composing: false,
        is_submitting: false,
        is_changing_upload: false,
        is_uploading: false,
        progress: 0,
        media_attachments: [],
        poll: null,
        suggestion_token: null,
        suggestions: [],
        tagHistory: [],
        content_type: 'text/plain',
      },
    });
    expect(state.get('default')!.idempotencyKey.length === 36);
  });

  describe('COMPOSE_SET_STATUS', () => {
    it('strips Pleroma integer attachments', () => {
      const action = {
        type: actions.COMPOSE_SET_STATUS,
        id: 'compose-modal',
        status: normalizeStatus(fromJS(require('soapbox/__fixtures__/pleroma-status-deleted.json'))),
        v: { software: 'Pleroma' },
        withRedraft: true,
      };

      const result = reducer(undefined, action as any);
      expect(result.get('compose-modal')!.media_attachments.isEmpty()).toBe(true);
    });

    it('leaves non-Pleroma integer attachments alone', () => {
      const action = {
        type: actions.COMPOSE_SET_STATUS,
        id: 'compose-modal',
        status: normalizeStatus(fromJS(require('soapbox/__fixtures__/pleroma-status-deleted.json'))),
      };

      const result = reducer(undefined, action as any);
      expect(result.get('compose-modal')!.media_attachments.getIn([0, 'id'])).toEqual('508107650');
    });

    it('sets the id when editing a post', () => {
      const action = {
        id: 'compose-modal',
        withRedraft: false,
        type: actions.COMPOSE_SET_STATUS,
        status: normalizeStatus(fromJS(require('soapbox/__fixtures__/pleroma-status-deleted.json'))),
      };

      const result = reducer(undefined, action as any);
      expect(result.get('compose-modal')!.id).toEqual('AHU2RrX0wdcwzCYjFQ');
    });

    it('does not set the id when redrafting a post', () => {
      const action = {
        id: 'compose-modal',
        withRedraft: true,
        type: actions.COMPOSE_SET_STATUS,
        status: normalizeStatus(fromJS(require('soapbox/__fixtures__/pleroma-status-deleted.json'))),
      };

      const result = reducer(undefined, action as any);
      expect(result.get('compose-modal')!.id).toEqual(null);
    });
  });

  it('uses \'public\' scope as default', () => {
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: ImmutableRecord({})(),
      account: ImmutableRecord({})(),
    };
    expect(reducer(undefined, action as any).toJS()['compose-modal']).toMatchObject({ privacy: 'public' });
  });

  it('uses \'direct\' scope when replying to a DM', () => {
    const state = initialState.set('default', ReducerCompose({ privacy: 'public' }));
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: ImmutableRecord({ visibility: 'direct' })(),
      account: ImmutableRecord({})(),
    };
    expect(reducer(state as any, action as any).toJS()['compose-modal']).toMatchObject({ privacy: 'direct' });
  });

  it('uses \'private\' scope when replying to a private post', () => {
    const state = initialState.set('default', ReducerCompose({ privacy: 'public' }));
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: ImmutableRecord({ visibility: 'private' })(),
      account: ImmutableRecord({})(),
    };
    expect(reducer(state as any, action as any).toJS()['compose-modal']).toMatchObject({ privacy: 'private' });
  });

  it('uses \'unlisted\' scope when replying to an unlisted post', () => {
    const state = initialState.set('default', ReducerCompose({ privacy: 'public' }));
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: ImmutableRecord({ visibility: 'unlisted' })(),
      account: ImmutableRecord({})(),
    };
    expect(reducer(state, action as any).toJS()['compose-modal']).toMatchObject({ privacy: 'unlisted' });
  });

  it('uses \'private\' scope when set as preference and replying to a public post', () => {
    const state = initialState.set('default', ReducerCompose({ privacy: 'private' }));
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: ImmutableRecord({ visibility: 'public' })(),
      account: ImmutableRecord({})(),
    };
    expect(reducer(state, action as any).toJS()['compose-modal']).toMatchObject({ privacy: 'private' });
  });

  it('uses \'unlisted\' scope when set as preference and replying to a public post', () => {
    const state = initialState.set('default', ReducerCompose({ privacy: 'unlisted' }));
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: ImmutableRecord({ visibility: 'public' })(),
      account: ImmutableRecord({})(),
    };
    expect(reducer(state, action as any).toJS()['compose-modal']).toMatchObject({ privacy: 'unlisted' });
  });

  it('sets preferred scope on user login', () => {
    const state = initialState.set('default', ReducerCompose({ privacy: 'public' }));
    const action = {
      type: ME_FETCH_SUCCESS,
      me: { pleroma: { settings_store: { soapbox_fe: { defaultPrivacy: 'unlisted' } } } },
    };
    expect(reducer(state, action).toJS().default).toMatchObject({
      privacy: 'unlisted',
    });
  });

  it('sets preferred scope on settings change', () => {
    const state = initialState.set('default', ReducerCompose({ privacy: 'public' }));
    const action = {
      type: SETTING_CHANGE,
      path: ['defaultPrivacy'],
      value: 'unlisted',
    };
    expect(reducer(state, action).toJS().default).toMatchObject({
      privacy: 'unlisted',
    });
  });

  it('sets default scope on settings save', () => {
    const state = initialState.set('default', ReducerCompose({ privacy: 'public' }));
    const action = {
      type: ME_PATCH_SUCCESS,
      me: { pleroma: { settings_store: { soapbox_fe: { defaultPrivacy: 'unlisted' } } } },
    };
    expect(reducer(state, action).toJS().default).toMatchObject({
      privacy: 'unlisted',
    });
  });

  it('should handle COMPOSE_SPOILERNESS_CHANGE on CW button click', () => {
    const state = initialState.set('home', ReducerCompose({ spoiler_text: 'spoiler text', spoiler: true, sensitive: true, media_attachments: ImmutableList() }));
    const action = {
      type: actions.COMPOSE_SPOILERNESS_CHANGE,
      id: 'home',
    };
    expect(reducer(state, action).toJS().home).toMatchObject({
      spoiler: false,
      spoiler_text: '',
      sensitive: false,
    });
  });

  it('should handle COMPOSE_SPOILER_TEXT_CHANGE', () => {
    const state = initialState.set('home', ReducerCompose({ spoiler_text: 'prevtext' }));
    const action = {
      type: actions.COMPOSE_SPOILER_TEXT_CHANGE,
      id: 'home',
      text: 'nexttext',
    };
    expect(reducer(state, action).toJS().home).toMatchObject({
      spoiler_text: 'nexttext',
    });
  });

  it('should handle COMPOSE_VISIBILITY_CHANGE', () => {
    const state = initialState.set('home', ReducerCompose({ privacy: 'public' }));
    const action = {
      type: actions.COMPOSE_VISIBILITY_CHANGE,
      id: 'home',
      value: 'direct',
    };
    expect(reducer(state, action).toJS().home).toMatchObject({
      privacy: 'direct',
    });
  });

  describe('COMPOSE_CHANGE', () => {
    it('should handle text changing', () => {
      const state = initialState.set('home', ReducerCompose({ text: 'prevtext' }));
      const action = {
        type: actions.COMPOSE_CHANGE,
        id: 'home',
        text: 'nexttext',
      };
      expect(reducer(state, action).toJS().home).toMatchObject({
        text: 'nexttext',
      });
    });
  });

  it('should handle COMPOSE_SUBMIT_REQUEST', () => {
    const state = initialState.set('home', ReducerCompose({ is_submitting: false }));
    const action = {
      type: actions.COMPOSE_SUBMIT_REQUEST,
      id: 'home',
    };
    expect(reducer(state, action).toJS().home).toMatchObject({
      is_submitting: true,
    });
  });

  it('should handle COMPOSE_UPLOAD_CHANGE_REQUEST', () => {
    const state = initialState.set('home', ReducerCompose({ is_changing_upload: false }));
    const action = {
      type: actions.COMPOSE_UPLOAD_CHANGE_REQUEST,
      id: 'home',
    };
    expect(reducer(state, action as any).toJS().home).toMatchObject({
      is_changing_upload: true,
    });
  });

  it('should handle COMPOSE_SUBMIT_SUCCESS', () => {
    const state = initialState.set('home', ReducerCompose({ privacy: 'private' }));
    const action = {
      type: actions.COMPOSE_SUBMIT_SUCCESS,
      id: 'home',
    };
    expect(reducer(state, action as any).toJS().home).toMatchObject({
      privacy: 'public',
    });
  });

  it('should handle COMPOSE_SUBMIT_FAIL', () => {
    const state = initialState.set('home', ReducerCompose({ is_submitting: true }));
    const action = {
      type: actions.COMPOSE_SUBMIT_FAIL,
      id: 'home',
    };
    expect(reducer(state, action as any).toJS().home).toMatchObject({
      is_submitting: false,
    });
  });

  it('should handle COMPOSE_UPLOAD_CHANGE_FAIL', () => {
    const state = initialState.set('home', ReducerCompose({ is_changing_upload: true }));
    const action = {
      type: actions.COMPOSE_UPLOAD_CHANGE_FAIL,
      composeId: 'home',
    };
    expect(reducer(state, action as any).toJS().home).toMatchObject({
      is_changing_upload: false,
    });
  });

  it('should handle COMPOSE_UPLOAD_REQUEST', () => {
    const state = initialState.set('home', ReducerCompose({ is_uploading: false }));
    const action = {
      type: actions.COMPOSE_UPLOAD_REQUEST,
      id: 'home',
    };
    expect(reducer(state, action as any).toJS().home).toMatchObject({
      is_uploading: true,
    });
  });

  it('should handle COMPOSE_UPLOAD_SUCCESS', () => {
    const state = initialState.set('home', ReducerCompose({ media_attachments: ImmutableList() }));
    const media = [
      {
        description: null,
        id: '1375732379',
        pleroma: {
          mime_type: 'image/jpeg',
        },
        preview_url: 'https://media.gleasonator.com/media_attachments/files/000/853/856/original/7035d67937053e1d.jpg',
        remote_url: 'https://media.gleasonator.com/media_attachments/files/000/853/856/original/7035d67937053e1d.jpg',
        text_url: 'https://media.gleasonator.com/media_attachments/files/000/853/856/original/7035d67937053e1d.jpg',
        type: 'image',
        url: 'https://media.gleasonator.com/media_attachments/files/000/853/856/original/7035d67937053e1d.jpg',
      },
    ];
    const action = {
      type: actions.COMPOSE_UPLOAD_SUCCESS,
      id: 'home',
      media: media,
      skipLoading: true,
    };
    expect(reducer(state, action as any).toJS().home).toMatchObject({
      is_uploading: false,
    });
  });

  it('should handle COMPOSE_UPLOAD_FAIL', () => {
    const state = initialState.set('home', ReducerCompose({ is_uploading: true }));
    const action = {
      type: actions.COMPOSE_UPLOAD_FAIL,
      id: 'home',
    };
    expect(reducer(state, action as any).toJS().home).toMatchObject({
      is_uploading: false,
    });
  });

  it('should handle COMPOSE_UPLOAD_PROGRESS', () => {
    const state = initialState.set('home', ReducerCompose({ progress: 0 }));
    const action = {
      type: actions.COMPOSE_UPLOAD_PROGRESS,
      id: 'home',
      loaded: 10,
      total: 15,
    };
    expect(reducer(state, action).toJS().home).toMatchObject({
      progress: 67,
    });
  });

  it('should handle COMPOSE_SUGGESTIONS_CLEAR', () => {
    const state = initialState.set('home', ReducerCompose());
    const action = {
      type: actions.COMPOSE_SUGGESTIONS_CLEAR,
      id: 'home',
      suggestions: [],
      suggestion_token: 'aiekdns3',
    };
    expect(reducer(state, action).toJS().home).toMatchObject({
      suggestion_token: null,
    });
  });

  it('should handle COMPOSE_SUGGESTION_TAGS_UPDATE', () => {
    const state = initialState.set('home', ReducerCompose({ tagHistory: ImmutableList([ 'hashtag' ]) }));
    const action = {
      type: actions.COMPOSE_SUGGESTION_TAGS_UPDATE,
      id: 'home',
      token: 'aaadken3',
      currentTrends: ImmutableList([
        TagRecord({ name: 'hashtag' }),
      ]),
    };
    expect(reducer(state, action).toJS().home).toMatchObject({
      suggestion_token: 'aaadken3',
      suggestions: [],
      tagHistory: [ 'hashtag' ],
    });
  });

  it('should handle COMPOSE_TAG_HISTORY_UPDATE', () => {
    const action = {
      type: actions.COMPOSE_TAG_HISTORY_UPDATE,
      id: 'home',
      tags: [ 'hashtag', 'hashtag2'],
    };
    expect(reducer(undefined, action).toJS().home).toMatchObject({
      tagHistory: [ 'hashtag', 'hashtag2' ],
    });
  });

  it('should handle TIMELINE_DELETE - delete status from timeline', () => {
    const state = initialState.set('compose-modal', ReducerCompose({ in_reply_to: '9wk6pmImMrZjgrK7iC' }));
    const action = {
      type: TIMELINE_DELETE,
      id: '9wk6pmImMrZjgrK7iC',
    };
    expect(reducer(state, action as any).toJS()['compose-modal']).toMatchObject({
      in_reply_to: null,
    });
  });

  it('should handle COMPOSE_POLL_ADD', () => {
    const state = initialState.set('home', ReducerCompose({ poll: null }));
    const initialPoll = Object({
      options: [
        '',
        '',
      ],
      expires_in: 86400,
      multiple: false,
    });
    const action = {
      type: actions.COMPOSE_POLL_ADD,
      id: 'home',
    };
    expect(reducer(state, action).toJS().home).toMatchObject({
      poll: initialPoll,
    });
  });

  it('should handle COMPOSE_POLL_REMOVE', () => {
    const state = initialState.set('home', ReducerCompose());
    const action = {
      type: actions.COMPOSE_POLL_REMOVE,
      id: 'home',
    };
    expect(reducer(state, action).toJS().home).toMatchObject({
      poll: null,
    });
  });

  it('should handle COMPOSE_POLL_OPTION_CHANGE', () => {
    const initialPoll = Object({
      options: [
        'option 1',
        'option 2',
      ],
      expires_in: 86400,
      multiple: false,
    });
    const state = initialState.set('home', ReducerCompose({ poll: initialPoll }));
    const action = {
      type: actions.COMPOSE_POLL_OPTION_CHANGE,
      id: 'home',
      index: 0,
      title: 'change option',
    };
    const updatedPoll = Object({
      options: [
        'change option',
        'option 2',
      ],
      expires_in: 86400,
      multiple: false,
    });
    expect(reducer(state, action).toJS().home).toMatchObject({
      poll: updatedPoll,
    });
  });

  it('sets the post content-type', () => {
    const state = initialState.set('home', ReducerCompose());
    const action = {
      type: actions.COMPOSE_TYPE_CHANGE,
      id: 'home',
      value: 'text/plain',
    };
    expect(reducer(state, action).toJS().home).toMatchObject({ content_type: 'text/plain' });
  });
});
