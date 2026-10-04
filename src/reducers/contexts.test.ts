import { describe, expect, it } from 'vitest';

import { STATUS_IMPORT } from '@/actions/importer/index.ts';
import { CONTEXT_FETCH_SUCCESS } from '@/actions/statuses.ts';
import { TIMELINE_DELETE } from '@/actions/timelines.ts';
import { applyActions } from '@/jest/test-helpers.tsx';

import reducer, { initialState } from './contexts.ts';

describe('contexts reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual({
      inReplyTos: {},
      replies: {},
    });
  });

  describe(CONTEXT_FETCH_SUCCESS, () => {
    it('inserts a tombstone connecting an orphaned descendant', () => {
      const status = { id: 'A', in_reply_to_id: null };

      const context = {
        id: 'A',
        ancestors: [],
        descendants: [
          { id: 'C', in_reply_to_id: 'B' },
        ],
      };

      const actions = [
        { type: STATUS_IMPORT, status },
        { type: CONTEXT_FETCH_SUCCESS, ...context },
      ];

      const result = applyActions(undefined, actions, reducer);
      expect(result.inReplyTos.C).toBe('C-tombstone');
      expect(result.replies.A).toEqual(['C-tombstone']);
    });

    it('inserts a tombstone connecting an orphaned descendant (with null in_reply_to_id)', () => {
      const status = { id: 'A', in_reply_to_id: null };

      const context = {
        id: 'A',
        ancestors: [],
        descendants: [
          { id: 'C', in_reply_to_id: null },
        ],
      };

      const actions = [
        { type: STATUS_IMPORT, status },
        { type: CONTEXT_FETCH_SUCCESS, ...context },
      ];

      const result = applyActions(undefined, actions, reducer);
      expect(result.inReplyTos.C).toBe('C-tombstone');
      expect(result.replies.A).toEqual(['C-tombstone']);
    });

    it('doesn\'t explode when it encounters a loop', () => {
      const status = { id: 'A', in_reply_to_id: null };

      const context = {
        id: 'A',
        ancestors: [],
        descendants: [
          { id: 'C', in_reply_to_id: 'E' },
          { id: 'D', in_reply_to_id: 'C' },
          { id: 'E', in_reply_to_id: 'D' },
          { id: 'F', in_reply_to_id: 'F' },
        ],
      };

      const actions = [
        { type: STATUS_IMPORT, status },
        { type: CONTEXT_FETCH_SUCCESS, ...context },
      ];

      const result = applyActions(undefined, actions, reducer);

      // These checks are superficial. We just don't want a stack overflow!
      expect(result.inReplyTos.C).toBe('C-tombstone');
      expect(result.replies.A).toEqual(['C-tombstone', 'F-tombstone']);
    });
  });

  describe(TIMELINE_DELETE, () => {
    it('deletes the status', () => {
      const action = { type: TIMELINE_DELETE, id: 'B' };

      const state = {
        ...initialState,
        inReplyTos: {
          B: 'A',
          C: 'B',
        },
        replies: {
          A: ['B'],
          B: ['C'],
        },
      };

      const expected = {
        inReplyTos: {},
        replies: {
          A: [],
        },
      };

      expect(reducer(state, action)).toEqual(expected);
    });
  });
});
