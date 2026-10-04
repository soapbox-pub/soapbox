import { defineMessages, type MessageDescriptor } from 'react-intl';

import { normalizeSoapboxConfig } from '@/normalizers/index.ts';

import type { SoapboxConfig } from '@/types/soapbox.ts';

/**
 * A color theme the user can pick instead of the server's own.
 * It goes through the same pipeline as an admin-configured brand color,
 * so presets get the full generated palettes in every mode.
 */
interface ThemePreset {
  id: string;
  brandColor: string;
  /** Generated from the brand color if omitted. */
  accentColor?: string;
}

const themePresets: ThemePreset[] = [
  { id: 'azure', brandColor: '#0482d8' },
  { id: 'indigo', brandColor: '#4f46e5' },
  { id: 'violet', brandColor: '#7c3aed' },
  { id: 'pink', brandColor: '#db2777' },
  { id: 'red', brandColor: '#dc2626' },
  { id: 'orange', brandColor: '#ea580c' },
  { id: 'green', brandColor: '#16a34a' },
  { id: 'teal', brandColor: '#0d9488' },
  { id: 'slate', brandColor: '#475569' },
];

const presetMessages: Record<string, MessageDescriptor> = defineMessages({
  azure: { id: 'theme_preset.azure', defaultMessage: 'Azure' },
  indigo: { id: 'theme_preset.indigo', defaultMessage: 'Indigo' },
  violet: { id: 'theme_preset.violet', defaultMessage: 'Violet' },
  pink: { id: 'theme_preset.pink', defaultMessage: 'Pink' },
  red: { id: 'theme_preset.red', defaultMessage: 'Red' },
  orange: { id: 'theme_preset.orange', defaultMessage: 'Orange' },
  green: { id: 'theme_preset.green', defaultMessage: 'Green' },
  teal: { id: 'theme_preset.teal', defaultMessage: 'Teal' },
  slate: { id: 'theme_preset.slate', defaultMessage: 'Slate' },
});

function getThemePreset(id: string | null | undefined): ThemePreset | undefined {
  return themePresets.find((preset) => preset.id === id);
}

/** Full Soapbox config for a preset, with generated palettes. */
function presetToSoapboxConfig(preset: ThemePreset): SoapboxConfig {
  return normalizeSoapboxConfig({ brandColor: preset.brandColor, accentColor: preset.accentColor });
}

/**
 * Settings are only saved to the backend, which doesn't exist before login.
 * Theme choices are mirrored here so they survive reloads on any page.
 */
const THEME_STORAGE_KEY = 'soapbox:theme';

interface StoredTheme {
  themeMode?: string;
  themePreset?: string | null;
}

function loadStoredTheme(): StoredTheme {
  try {
    const data = JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) ?? '{}');
    const stored: StoredTheme = {};
    if (typeof data.themeMode === 'string') stored.themeMode = data.themeMode;
    if (typeof data.themePreset === 'string' || data.themePreset === null) stored.themePreset = data.themePreset;
    return stored;
  } catch {
    return {};
  }
}

function saveStoredTheme(theme: StoredTheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch {
    // Storage may be unavailable (private mode, quota). The theme still applies for this session.
  }
}

export {
  themePresets,
  presetMessages,
  getThemePreset,
  presetToSoapboxConfig,
  loadStoredTheme,
  saveStoredTheme,
  type ThemePreset,
  type StoredTheme,
};
