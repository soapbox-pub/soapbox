import { afterEach, describe, expect, it } from 'vitest';

import { loadStoredTheme, saveStoredTheme } from './theme-presets.ts';

describe('stored theme', () => {
  afterEach(() => localStorage.clear());

  it('is empty when nothing was saved', () => {
    expect(loadStoredTheme()).toEqual({});
  });

  it('round-trips the mode and preset', () => {
    saveStoredTheme({ themeMode: 'dark', themePreset: 'violet' });
    expect(loadStoredTheme()).toEqual({ themeMode: 'dark', themePreset: 'violet' });
  });

  it('ignores garbage', () => {
    localStorage.setItem('soapbox:theme', '{"themeMode":1,"themePreset":{}}');
    expect(loadStoredTheme()).toEqual({});

    localStorage.setItem('soapbox:theme', 'not json');
    expect(loadStoredTheme()).toEqual({});
  });
});
