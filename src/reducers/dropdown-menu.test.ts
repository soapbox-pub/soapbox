import { describe, expect, it } from 'vitest';

import reducer from './dropdown-menu.ts';

describe('dropdown_menu reducer', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {} as any).toJS()).toEqual({
      isOpen: false,
    });
  });
});
