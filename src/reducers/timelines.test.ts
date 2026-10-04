import { describe, expect, it } from 'vitest';

import {
  TIMELINE_EXPAND_REQUEST,
  TIMELINE_EXPAND_FAIL,
  TIMELINE_EXPAND_SUCCESS,
} from '@/actions/timelines.ts';

import reducer, { newTimeline } from './timelines.ts';

describe('timelines reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual({});
  });

  describe('TIMELINE_EXPAND_REQUEST', () => {
    it('sets loading to true', () => {
      const action = {
        type: TIMELINE_EXPAND_REQUEST,
        timeline: 'home',
      };

      const result = reducer(undefined, action);
      expect(result.home.isLoading).toBe(true);
    });
  });

  describe('TIMELINE_EXPAND_FAIL', () => {
    it('sets loading to false', () => {
      const state = {
        home: newTimeline({ isLoading: true }),
      };

      const action = {
        type: TIMELINE_EXPAND_FAIL,
        timeline: 'home',
      };

      const result = reducer(state, action);
      expect(result.home.isLoading).toBe(false);
    });
  });

  describe('TIMELINE_EXPAND_SUCCESS', () => {
    it('sets loading to false', () => {
      const state = {
        home: newTimeline({ isLoading: true }),
      };

      const action = {
        type: TIMELINE_EXPAND_SUCCESS,
        timeline: 'home',
      };

      const result = reducer(state, action);
      expect(result.home.isLoading).toBe(false);
    });

    it('adds the status IDs', () => {
      const expected = ['1', '2', '5'];

      const action = {
        type: TIMELINE_EXPAND_SUCCESS,
        timeline: 'home',
        statuses: [{ id: '1' }, { id: '2' }, { id: '5' }],
      };

      const result = reducer(undefined, action);
      expect(result.home.items).toEqual(expected);
    });

    it('merges new status IDs', () => {
      const state = {
        home: newTimeline({ items: ['5', '2', '1'] }),
      };

      const expected = ['6', '5', '4', '2', '1'];

      const action = {
        type: TIMELINE_EXPAND_SUCCESS,
        timeline: 'home',
        statuses: [{ id: '6' }, { id: '5' }, { id: '4' }],
      };

      const result = reducer(state, action);
      expect(result.home.items).toEqual(expected);
    });

    it('merges old status IDs', () => {
      const state = {
        home: newTimeline({ items: ['6', '4', '3'] }),
      };

      const expected = ['6', '4', '3', '5', '2', '1'];

      const action = {
        type: TIMELINE_EXPAND_SUCCESS,
        timeline: 'home',
        statuses: [{ id: '5' }, { id: '2' }, { id: '1' }],
      };

      const result = reducer(state, action);
      expect(result.home.items).toEqual(expected);
    });

    it('overrides pinned post IDs', () => {
      const state = {
        'account:1:pinned': newTimeline({ items: ['5', '2', '1'] }),
      };

      const expected = ['9', '8', '7'];

      const action = {
        type: TIMELINE_EXPAND_SUCCESS,
        timeline: 'home',
        statuses: [{ id: '9' }, { id: '8' }, { id: '7' }],
      };

      const result = reducer(state, action);
      expect(result.home.items).toEqual(expected);
    });
  });
});
