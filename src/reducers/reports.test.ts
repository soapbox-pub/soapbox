import { describe, expect, it } from 'vitest';

import reducer from './reports.ts';

describe('reports reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any).toJS()).toEqual({
      new: {
        isSubmitting: false,
        account_id: null,
        status_ids: [],
        chat_message: null,
        group: null,
        entityType: '',
        comment: '',
        forward: false,
        block: false,
        rule_ids: [],
      },
    });
  });
});
