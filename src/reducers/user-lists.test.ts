import { describe, expect, it } from 'vitest';

import reducer from './user-lists.ts';

describe('user_lists reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any)).toMatchObject({
      followers: {},
      following: {},
      reblogged_by: {},
      favourited_by: {},
      reactions: {},
      follow_requests: { next: null, items: [], isLoading: false },
      blocks: { next: null, items: [], isLoading: false },
      mutes: { next: null, items: [], isLoading: false },
      directory: { next: null, items: [], isLoading: true },
      pinned: {},
      birthday_reminders: {},
      familiar_followers: {},
    });
  });
});
