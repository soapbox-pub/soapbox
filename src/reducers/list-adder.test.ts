import { describe, expect, it } from 'vitest';

import * as actions from '@/actions/lists.ts';

import reducer from './list-adder.ts';

describe('list_adder reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toMatchObject({
      accountId: null,

      lists: {
        items: [],
        loaded: false,
        isLoading: false,
      },
    });
  });

  it('should handle LIST_ADDER_RESET', () => {
    const state = {
      accountId: null,

      lists: {
        items: [],
        loaded: false,
        isLoading: false,
      },
    };
    const action = {
      type: actions.LIST_ADDER_RESET,
    };
    expect(reducer(state, action)).toMatchObject({
      accountId: null,

      lists: {
        items: [],
        loaded: false,
        isLoading: false,
      },
    });
  });

  it('should handle LIST_ADDER_LISTS_FETCH_REQUEST', () => {
    const state = {
      accountId: null,

      lists: {
        items: [],
        loaded: false,
        isLoading: false,
      },
    };
    const action = {
      type: actions.LIST_ADDER_LISTS_FETCH_REQUEST,
    };
    expect(reducer(state, action)).toMatchObject({
      accountId: null,

      lists: {
        items: [],
        loaded: false,
        isLoading: true,
      },
    });
  });

  it('should handle LIST_ADDER_LISTS_FETCH_FAIL', () => {
    const state = {
      accountId: null,

      lists: {
        items: [],
        loaded: false,
        isLoading: false,
      },
    };
    const action = {
      type: actions.LIST_ADDER_LISTS_FETCH_FAIL,
    };
    expect(reducer(state, action)).toMatchObject({
      accountId: null,

      lists: {
        items: [],
        loaded: false,
        isLoading: false,
      },
    });
  });

  // it('should handle LIST_ADDER_LISTS_FETCH_SUCCESS', () => {
  //   const state = {
  //     accountId: null,
  //
  //     lists: {
  //       items: [],
  //       loaded: false,
  //       isLoading: false,
  //     },
  //   };
  //   const action = {
  //     type: actions.LIST_ADDER_LISTS_FETCH_SUCCESS,
  //   };
  //   expect(reducer(state, action)).toEqual({
  //     accountId: null,
  //
  //     lists: {
  //       items: [],
  //       loaded: true,
  //       isLoading: false,
  //     },
  //   });
  // });

});
