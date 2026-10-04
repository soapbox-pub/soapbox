import checkIcon from '@tabler/icons/outline/check.svg';
import deviceDesktopIcon from '@tabler/icons/outline/device-desktop.svg';
import moonIcon from '@tabler/icons/outline/moon.svg';
import shadowIcon from '@tabler/icons/outline/shadow.svg';
import sunIcon from '@tabler/icons/outline/sun.svg';
import clsx from 'clsx';
import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting } from '@/actions/settings.ts';
import Icon from '@/components/ui/icon.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useSettings } from '@/hooks/useSettings.ts';
import { useSoapboxConfig } from '@/hooks/useSoapboxConfig.ts';
import { useTheme } from '@/hooks/useTheme.ts';
import { presetMessages, presetToSoapboxConfig, themePresets } from '@/utils/theme-presets.ts';

import type { SoapboxConfig } from '@/types/soapbox.ts';

const messages = defineMessages({
  mode: { id: 'theme_picker.mode', defaultMessage: 'Appearance' },
  colors: { id: 'theme_picker.colors', defaultMessage: 'Color' },
  default: { id: 'theme_picker.default', defaultMessage: 'Default' },
  system: { id: 'theme_toggle.system', defaultMessage: 'System' },
  light: { id: 'theme_toggle.light', defaultMessage: 'Light' },
  dark: { id: 'theme_toggle.dark', defaultMessage: 'Dark' },
  black: { id: 'theme_toggle.black', defaultMessage: 'Black' },
});

const modes = [
  { value: 'system', icon: deviceDesktopIcon, message: messages.system },
  { value: 'light', icon: sunIcon, message: messages.light },
  { value: 'dark', icon: moonIcon, message: messages.dark },
  { value: 'black', icon: shadowIcon, message: messages.black },
] as const;

/** Lets anyone choose light/dark mode and a color preset. Choices persist with or without an account. */
const ThemePicker: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { themeMode, themePreset } = useSettings();
  const soapboxConfig = useSoapboxConfig();

  // The server's own brand color is the "Default" swatch, so don't repeat it as a preset.
  const presets = useMemo(() => themePresets
    .filter((preset) => preset.brandColor.toLowerCase() !== soapboxConfig.brandColor.toLowerCase())
    .map((preset) => ({ preset, config: presetToSoapboxConfig(preset) })),
  [soapboxConfig.brandColor]);

  const setMode = (value: string) => dispatch(changeSetting(['themeMode'], value));
  const setPreset = (value: string | null) => dispatch(changeSetting(['themePreset'], value));

  const activePreset = presets.some(({ preset }) => preset.id === themePreset) ? themePreset : null;

  return (
    <div className='space-y-4'>
      <div
        role='radiogroup'
        aria-label={intl.formatMessage(messages.mode)}
        className='grid grid-cols-4 gap-1 rounded-lg bg-gray-100 p-1 black:bg-gray-900 dark:bg-gray-800'
      >
        {modes.map(({ value, icon, message }) => {
          const isActive = themeMode === value;
          return (
            <button
              key={value}
              type='button'
              role='radio'
              aria-checked={isActive}
              onClick={() => setMode(value)}
              className={clsx(
                'flex flex-col items-center justify-center gap-0.5 rounded-md px-1 py-1.5 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                isActive
                  ? 'bg-white text-gray-900 shadow-sm black:bg-black dark:bg-gray-900 dark:text-gray-100'
                  : 'text-gray-700 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-200',
              )}
            >
              <Icon src={icon} className='size-4 shrink-0' aria-hidden />
              <span className='max-w-full truncate'>{intl.formatMessage(message)}</span>
            </button>
          );
        })}
      </div>

      <div role='radiogroup' aria-label={intl.formatMessage(messages.colors)} className='grid grid-cols-5 gap-2'>
        <Swatch
          config={soapboxConfig}
          label={intl.formatMessage(messages.default)}
          isActive={activePreset === null}
          onClick={() => setPreset(null)}
        />
        {presets.map(({ preset, config }) => (
          <Swatch
            key={preset.id}
            config={config}
            label={intl.formatMessage(presetMessages[preset.id])}
            isActive={activePreset === preset.id}
            onClick={() => setPreset(preset.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface ISwatch {
  config: SoapboxConfig;
  label: string;
  isActive: boolean;
  onClick(): void;
}

/** Miniature of the interface in a preset's colors, in the current light/dark mode. */
const Swatch: React.FC<ISwatch> = ({ config, label, isActive, onClick }) => {
  const theme = useTheme();
  const primary = config.colors.primary as Record<string, string> | undefined;
  const gray = config.colors.gray as Record<string, string> | undefined;

  const background = { light: '#fff', dark: primary?.['900'], black: '#000' }[theme];
  const line = theme === 'light' ? gray?.['300'] : gray?.['700'];

  return (
    <button
      type='button'
      role='radio'
      aria-checked={isActive}
      aria-label={label}
      onClick={onClick}
      className='group min-w-0 text-center focus:outline-none'
    >
      <div
        className={clsx(
          'relative aspect-[4/3] overflow-hidden rounded-lg ring-1 transition group-focus-visible:ring-2 group-focus-visible:ring-primary-500',
          isActive ? 'ring-2 ring-gray-900 dark:ring-gray-100' : 'ring-gray-300 group-hover:ring-gray-500 dark:ring-gray-700',
        )}
        style={{ backgroundColor: background }}
      >
        <div className='space-y-1 p-1.5'>
          <div className='h-1 w-3/4 rounded-full' style={{ backgroundColor: line }} />
          <div className='h-1 w-1/2 rounded-full' style={{ backgroundColor: line }} />
          <div className='!mt-1.5 h-2 w-1/2 rounded-full' style={{ backgroundColor: primary?.['500'] }} />
        </div>

        {isActive && (
          <div className='absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full text-white' style={{ backgroundColor: primary?.['500'] }}>
            <Icon src={checkIcon} className='size-3' aria-hidden />
          </div>
        )}
      </div>

      <span className={clsx('mt-1 block truncate text-xs', isActive ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-500')}>
        {label}
      </span>
    </button>
  );
};

export default ThemePicker;
