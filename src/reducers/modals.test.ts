import { describe, expect, it } from 'vitest';

import { MODAL_OPEN, MODAL_CLOSE } from '@/actions/modals.ts';

import reducer, { type Modal } from './modals.ts';

describe('modal reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toEqual([]);
  });

  it('should handle MODAL_OPEN', () => {
    const state: Modal[] = [];
    const action = {
      type: MODAL_OPEN,
      modalType: 'type1',
      modalProps: { props1: '1' },
    };
    expect(reducer(state, action)).toMatchObject([{
      modalType: 'type1',
      modalProps: { props1: '1' },
    }]);
  });

  it('should handle MODAL_CLOSE', () => {
    const state: Modal[] = [
      {
        modalType: 'type1',
        modalProps: { props1: '1' },
      },
    ];
    const action = {
      type: MODAL_CLOSE,
    };
    expect(reducer(state, action)).toMatchObject([]);
  });

  it('should handle MODAL_CLOSE with specified modalType', () => {
    const state: Modal[] = [
      {
        modalType: 'type1',
        modalProps: null,
      },
      {
        modalType: 'type2',
        modalProps: null,
      },
      {
        modalType: 'type1',
        modalProps: null,
      },
    ];
    const action = {
      type: MODAL_CLOSE,
      modalType: 'type2',
    };
    expect(reducer(state, action)).toEqual([
      {
        modalType: 'type1',
        modalProps: null,
      },
    ]);
  });

});
