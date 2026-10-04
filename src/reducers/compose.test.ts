import { describe, expect, it } from 'vitest';

import { COMPOSE_SET_STATUS } from '@/actions/compose-status.ts';
import * as actions from '@/actions/compose.ts';
import { ME_FETCH_SUCCESS, ME_PATCH_SUCCESS } from '@/actions/me.ts';
import { SETTING_CHANGE } from '@/actions/settings.ts';
import { TIMELINE_DELETE } from '@/actions/timelines.ts';
import { normalizeTag } from '@/normalizers/index.ts';
import { normalizeStatus } from '@/normalizers/status.ts';

import reducer, { initialState, newCompose } from './compose.ts';

describe('compose reducer', () => {
  it('returns the initial state by default', () => {
    const state = reducer(undefined, {} as any);
    expect(state).toMatchObject({
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
    expect(state.default.idempotencyKey.length === 36);
  });

  describe('COMPOSE_SET_STATUS', () => {
    it('strips Pleroma integer attachments', async () => {
      const status = await import('@/__fixtures__/pleroma-status-deleted.json');

      const action = {
        type: COMPOSE_SET_STATUS,
        id: 'compose-modal',
        status: normalizeStatus(status),
        v: { software: 'Pleroma' },
        withRedraft: true,
      };

      const result = reducer(undefined, action as any);
      expect(result['compose-modal'].media_attachments.length).toBe(0);
    });

    it('leaves non-Pleroma integer attachments alone', async () => {
      const status = await import('@/__fixtures__/pleroma-status-deleted.json');

      const action = {
        type: COMPOSE_SET_STATUS,
        id: 'compose-modal',
        status: normalizeStatus(status),
      };

      const result = reducer(undefined, action as any);
      expect(result['compose-modal'].media_attachments[0]?.id).toEqual('508107650');
    });

    it('sets the id when editing a post', async () => {
      const status = await import('@/__fixtures__/pleroma-status-deleted.json');

      const action = {
        id: 'compose-modal',
        withRedraft: false,
        type: COMPOSE_SET_STATUS,
        status: normalizeStatus(status),
      };

      const result = reducer(undefined, action as any);
      expect(result['compose-modal'].id).toEqual('AHU2RrX0wdcwzCYjFQ');
    });

    it('does not set the id when redrafting a post', async () => {
      const status = await import('@/__fixtures__/pleroma-status-deleted.json');

      const action = {
        id: 'compose-modal',
        withRedraft: true,
        type: COMPOSE_SET_STATUS,
        status: normalizeStatus(status),
      };

      const result = reducer(undefined, action as any);
      expect(result['compose-modal'].id).toEqual(null);
    });
  });

  it('uses \'public\' scope as default', () => {
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: {},
      account: {},
    };
    expect(reducer(undefined, action as any)['compose-modal']).toMatchObject({ privacy: 'public' });
  });

  it('uses \'direct\' scope when replying to a DM', () => {
    const state = { ...initialState, default: newCompose({ privacy: 'public' }) };
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: { visibility: 'direct' },
      account: {},
    };
    expect(reducer(state, action as any)['compose-modal']).toMatchObject({ privacy: 'direct' });
  });

  it('uses \'private\' scope when replying to a private post', () => {
    const state = { ...initialState, default: newCompose({ privacy: 'public' }) };
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: { visibility: 'private' },
      account: {},
    };
    expect(reducer(state, action as any)['compose-modal']).toMatchObject({ privacy: 'private' });
  });

  it('uses \'unlisted\' scope when replying to an unlisted post', () => {
    const state = { ...initialState, default: newCompose({ privacy: 'public' }) };
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: { visibility: 'unlisted' },
      account: {},
    };
    expect(reducer(state, action as any)['compose-modal']).toMatchObject({ privacy: 'unlisted' });
  });

  it('uses \'private\' scope when set as preference and replying to a public post', () => {
    const state = { ...initialState, default: newCompose({ privacy: 'private' }) };
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: { visibility: 'public' },
      account: {},
    };
    expect(reducer(state, action as any)['compose-modal']).toMatchObject({ privacy: 'private' });
  });

  it('uses \'unlisted\' scope when set as preference and replying to a public post', () => {
    const state = { ...initialState, default: newCompose({ privacy: 'unlisted' }) };
    const action = {
      type: actions.COMPOSE_REPLY,
      id: 'compose-modal',
      status: { visibility: 'public' },
      account: {},
    };
    expect(reducer(state, action as any)['compose-modal']).toMatchObject({ privacy: 'unlisted' });
  });

  it('sets preferred scope on user login', () => {
    const state = { ...initialState, default: newCompose({ privacy: 'public' }) };
    const action = {
      type: ME_FETCH_SUCCESS,
      me: { pleroma: { settings_store: { soapbox_fe: { defaultPrivacy: 'unlisted' } } } },
    };
    expect(reducer(state, action as any).default).toMatchObject({
      privacy: 'unlisted',
    });
  });

  it('sets preferred scope on settings change', () => {
    const state = { ...initialState, default: newCompose({ privacy: 'public' }) };
    const action = {
      type: SETTING_CHANGE,
      path: ['defaultPrivacy'],
      value: 'unlisted',
    };
    expect(reducer(state, action).default).toMatchObject({
      privacy: 'unlisted',
    });
  });

  it('sets default scope on settings save', () => {
    const state = { ...initialState, default: newCompose({ privacy: 'public' }) };
    const action = {
      type: ME_PATCH_SUCCESS,
      me: { pleroma: { settings_store: { soapbox_fe: { defaultPrivacy: 'unlisted' } } } },
    };
    expect(reducer(state, action).default).toMatchObject({
      privacy: 'unlisted',
    });
  });

  it('should handle COMPOSE_SPOILERNESS_CHANGE on CW button click', () => {
    const state = { ...initialState, home: newCompose({ spoiler_text: 'spoiler text', spoiler: true, sensitive: true, media_attachments: [] }) };
    const action = {
      type: actions.COMPOSE_SPOILERNESS_CHANGE,
      id: 'home',
    };
    expect(reducer(state, action).home).toMatchObject({
      spoiler: false,
      spoiler_text: '',
      sensitive: false,
    });
  });

  it('should handle COMPOSE_SPOILER_TEXT_CHANGE', () => {
    const state = { ...initialState, home: newCompose({ spoiler_text: 'prevtext' }) };
    const action = {
      type: actions.COMPOSE_SPOILER_TEXT_CHANGE,
      id: 'home',
      text: 'nexttext',
    };
    expect(reducer(state, action).home).toMatchObject({
      spoiler_text: 'nexttext',
    });
  });

  it('should handle COMPOSE_VISIBILITY_CHANGE', () => {
    const state = { ...initialState, home: newCompose({ privacy: 'public' }) };
    const action = {
      type: actions.COMPOSE_VISIBILITY_CHANGE,
      id: 'home',
      value: 'direct',
    };
    expect(reducer(state, action).home).toMatchObject({
      privacy: 'direct',
    });
  });

  describe('COMPOSE_CHANGE', () => {
    it('should handle text changing', () => {
      const state = { ...initialState, home: newCompose({ text: 'prevtext' }) };
      const action = {
        type: actions.COMPOSE_CHANGE,
        id: 'home',
        text: 'nexttext',
      };
      expect(reducer(state, action).home).toMatchObject({
        text: 'nexttext',
      });
    });
  });

  it('should handle COMPOSE_SUBMIT_REQUEST', () => {
    const state = { ...initialState, home: newCompose({ is_submitting: false }) };
    const action = {
      type: actions.COMPOSE_SUBMIT_REQUEST,
      id: 'home',
    };
    expect(reducer(state, action).home).toMatchObject({
      is_submitting: true,
    });
  });

  it('should handle COMPOSE_UPLOAD_CHANGE_REQUEST', () => {
    const state = { ...initialState, home: newCompose({ is_changing_upload: false }) };
    const action = {
      type: actions.COMPOSE_UPLOAD_CHANGE_REQUEST,
      id: 'home',
    };
    expect(reducer(state, action as any).home).toMatchObject({
      is_changing_upload: true,
    });
  });

  it('should handle COMPOSE_SUBMIT_SUCCESS', () => {
    const state = { ...initialState, home: newCompose({ privacy: 'private' }) };
    const action = {
      type: actions.COMPOSE_SUBMIT_SUCCESS,
      id: 'home',
    };
    expect(reducer(state, action as any).home).toMatchObject({
      privacy: 'public',
    });
  });

  it('should handle COMPOSE_SUBMIT_FAIL', () => {
    const state = { ...initialState, home: newCompose({ is_submitting: true }) };
    const action = {
      type: actions.COMPOSE_SUBMIT_FAIL,
      id: 'home',
    };
    expect(reducer(state, action as any).home).toMatchObject({
      is_submitting: false,
    });
  });

  it('should handle COMPOSE_UPLOAD_CHANGE_FAIL', () => {
    const state = { ...initialState, home: newCompose({ is_changing_upload: true }) };
    const action = {
      type: actions.COMPOSE_UPLOAD_CHANGE_FAIL,
      composeId: 'home',
    };
    expect(reducer(state, action as any).home).toMatchObject({
      is_changing_upload: false,
    });
  });

  it('should handle COMPOSE_UPLOAD_REQUEST', () => {
    const state = { ...initialState, home: newCompose({ is_uploading: false }) };
    const action = {
      type: actions.COMPOSE_UPLOAD_REQUEST,
      id: 'home',
    };
    expect(reducer(state, action as any).home).toMatchObject({
      is_uploading: true,
    });
  });

  it('should handle COMPOSE_UPLOAD_SUCCESS', () => {
    const state = { ...initialState, home: newCompose({ media_attachments: [] }) };
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
    expect(reducer(state, action as any).home).toMatchObject({
      is_uploading: false,
    });
  });

  it('should handle COMPOSE_UPLOAD_FAIL', () => {
    const state = { ...initialState, home: newCompose({ is_uploading: true }) };
    const action = {
      type: actions.COMPOSE_UPLOAD_FAIL,
      id: 'home',
    };
    expect(reducer(state, action as any).home).toMatchObject({
      is_uploading: false,
    });
  });

  it('should handle COMPOSE_UPLOAD_PROGRESS', () => {
    const state = { ...initialState, home: newCompose({ progress: 0 }) };
    const action = {
      type: actions.COMPOSE_UPLOAD_PROGRESS,
      id: 'home',
      loaded: 10,
      total: 15,
    };
    expect(reducer(state, action).home).toMatchObject({
      progress: 67,
    });
  });

  it('should handle COMPOSE_SUGGESTIONS_CLEAR', () => {
    const state = { ...initialState, home: newCompose() };
    const action = {
      type: actions.COMPOSE_SUGGESTIONS_CLEAR,
      id: 'home',
      suggestions: [],
      suggestion_token: 'aiekdns3',
    };
    expect(reducer(state, action).home).toMatchObject({
      suggestion_token: null,
    });
  });

  it('should handle COMPOSE_SUGGESTION_TAGS_UPDATE', () => {
    const state = { ...initialState, home: newCompose({ tagHistory: [ 'hashtag' ] }) };
    const action = {
      type: actions.COMPOSE_SUGGESTION_TAGS_UPDATE,
      id: 'home',
      token: 'aaadken3',
      tags: [
        normalizeTag({ name: 'hashtag' }),
      ],
    };
    expect(reducer(state, action).home).toMatchObject({
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
    expect(reducer(undefined, action).home).toMatchObject({
      tagHistory: [ 'hashtag', 'hashtag2' ],
    });
  });

  it('should handle TIMELINE_DELETE - delete status from timeline', () => {
    const state = { ...initialState, 'compose-modal': newCompose({ in_reply_to: '9wk6pmImMrZjgrK7iC' }) };
    const action = {
      type: TIMELINE_DELETE,
      id: '9wk6pmImMrZjgrK7iC',
    };
    expect(reducer(state, action as any)['compose-modal']).toMatchObject({
      in_reply_to: null,
    });
  });

  it('should handle COMPOSE_POLL_ADD', () => {
    const state = { ...initialState, home: newCompose({ poll: null }) };
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
    expect(reducer(state, action).home).toMatchObject({
      poll: initialPoll,
    });
  });

  it('should handle COMPOSE_POLL_REMOVE', () => {
    const state = { ...initialState, home: newCompose() };
    const action = {
      type: actions.COMPOSE_POLL_REMOVE,
      id: 'home',
    };
    expect(reducer(state, action).home).toMatchObject({
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
    const state = { ...initialState, home: newCompose({ poll: initialPoll }) };
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
    expect(reducer(state, action).home).toMatchObject({
      poll: updatedPoll,
    });
  });

  it('sets the post content-type', () => {
    const state = { ...initialState, home: newCompose() };
    const action = {
      type: actions.COMPOSE_TYPE_CHANGE,
      id: 'home',
      value: 'text/plain',
    };
    expect(reducer(state, action).home).toMatchObject({ content_type: 'text/plain' });
  });
});
