import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockStore, mockWindowProperty, rootState } from 'soapbox/jest/test-helpers';

import { checkOnboardingStatus, startOnboarding, endOnboarding } from './onboarding';

describe('checkOnboarding()', () => {
  let mockGetItem: any;

  mockWindowProperty('localStorage', {
    getItem: (key: string) => mockGetItem(key),
  });

  beforeEach(() => {
    mockGetItem = vi.fn().mockReturnValue(null);
  });

  it('does nothing if localStorage item is not set', async() => {
    mockGetItem = vi.fn().mockReturnValue(null);

    const state = { ...rootState };
    state.onboarding.needsOnboarding = false;
    const store = mockStore(state);

    await store.dispatch(checkOnboardingStatus());
    const actions = store.getActions();

    expect(actions).toEqual([]);
    expect(mockGetItem.mock.calls.length).toBe(1);
  });

  it('does nothing if localStorage item is invalid', async() => {
    mockGetItem = vi.fn().mockReturnValue('invalid');

    const state = { ...rootState };
    state.onboarding.needsOnboarding = false;
    const store = mockStore(state);

    await store.dispatch(checkOnboardingStatus());
    const actions = store.getActions();

    expect(actions).toEqual([]);
    expect(mockGetItem.mock.calls.length).toBe(1);
  });

  it('dispatches the correct action', async() => {
    mockGetItem = vi.fn().mockReturnValue('1');

    const state = { ...rootState };
    state.onboarding.needsOnboarding = false;
    const store = mockStore(state);

    await store.dispatch(checkOnboardingStatus());
    const actions = store.getActions();

    expect(actions).toEqual([{ type: 'ONBOARDING_START' }]);
    expect(mockGetItem.mock.calls.length).toBe(1);
  });
});

describe('startOnboarding()', () => {
  let mockSetItem: any;

  mockWindowProperty('localStorage', {
    setItem: (key: string, value: string) => mockSetItem(key, value),
  });

  beforeEach(() => {
    mockSetItem = vi.fn();
  });

  it('dispatches the correct action', async() => {
    const state = { ...rootState };
    state.onboarding.needsOnboarding = false;
    const store = mockStore(state);

    await store.dispatch(startOnboarding());
    const actions = store.getActions();

    expect(actions).toEqual([{ type: 'ONBOARDING_START' }]);
    expect(mockSetItem.mock.calls.length).toBe(1);
  });
});

describe('endOnboarding()', () => {
  let mockRemoveItem: any;

  mockWindowProperty('localStorage', {
    removeItem: (key: string) => mockRemoveItem(key),
  });

  beforeEach(() => {
    mockRemoveItem = vi.fn();
  });

  it('dispatches the correct action', async() => {
    const state = { ...rootState };
    state.onboarding.needsOnboarding = false;
    const store = mockStore(state);

    await store.dispatch(endOnboarding());
    const actions = store.getActions();

    expect(actions).toEqual([{ type: 'ONBOARDING_END' }]);
    expect(mockRemoveItem.mock.calls.length).toBe(1);
  });
});
