import { describe, expect, it } from 'vitest';

import * as actions from '@/actions/conversations.ts';

import reducer from './conversations.ts';

describe('conversations reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toMatchObject({
      items: [],
      isLoading: false,
      hasMore: true,
      mounted: 0,
    });
  });

  it('should handle CONVERSATIONS_FETCH_REQUEST', () => {
    const state = { items: [], isLoading: false, hasMore: true, mounted: 0 };
    const action = {
      type: actions.CONVERSATIONS_FETCH_REQUEST,
    };
    expect(reducer(state, action)).toMatchObject({
      isLoading: true,
    });
  });

  it('should handle CONVERSATIONS_FETCH_FAIL', () => {
    const state = { items: [], isLoading: true, hasMore: true, mounted: 0 };
    const action = {
      type: actions.CONVERSATIONS_FETCH_FAIL,
    };
    expect(reducer(state, action)).toMatchObject({
      isLoading: false,
    });
  });

  // it('should handle the Action CONVERSATIONS_MOUNT', () => {
  //   expect(
  //     reducer(
  //       {
  //         mounted: false,
  //       },
  //       {
  //         type: 'CONVERSATIONS_MOUNT',
  //       },
  //     ),
  //   ).toEqual({
  //     mounted: true,
  //   });
  // });
  //
  // it('should handle the Action CONVERSATIONS_UNMOUNT', () => {
  //   expect(
  //     reducer(
  //       {
  //         mounted: true,
  //       },
  //       {
  //         type: 'CONVERSATIONS_UNMOUNT',
  //       },
  //     ),
  //   ).toEqual({
  //     mounted: false,
  //   });
  // });

});
