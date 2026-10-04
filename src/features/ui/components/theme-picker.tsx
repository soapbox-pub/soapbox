import checkIcon from '@tabler/icons/outline/check.svg';
import clsx from 'clsx';
import { useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { changeSetting, SETTING_CHANGE } from '@/actions/settings.ts';
import Icon from '@/components/ui/icon.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useSettings } from '@/hooks/useSettings.ts';
import { useSoapboxConfig } from '@/hooks/useSoapboxConfig.ts';
import { presetMessages, presetToSoapboxConfig, themePresets, type ThemeMode } from '@/utils/theme-presets.ts';

import type { SoapboxConfig } from '@/types/soapbox.ts';

const messages = defineMessages({
  label: { id: 'theme_picker.label', defaultMessage: 'Theme' },
  system: { id: 'theme_toggle.system', defaultMessage: 'System' },
  light: { id: 'theme_toggle.light', defaultMessage: 'Light' },
  dark: { id: 'theme_toggle.dark', defaultMessage: 'Dark' },
  black: { id: 'theme_toggle.black', defaultMessage: 'Black' },
});

interface ThemeOption {
  key: string;
  label: string;
  /** Preset ID, or `null` for the server's own colors. */
  preset: string | null;
  mode: ThemeMode | 'system';
  config: SoapboxConfig;
}

/**
 * One row of themes to pick from. Each theme sets both the colors and the
 * light/dark mode: the server's colors come in every mode, presets in one.
 */
const ThemePicker: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { themeMode, themePreset } = useSettings();
  const soapboxConfig = useSoapboxConfig();

  const options = useMemo((): ThemeOption[] => {
    const server = (['system', 'light', 'dark', 'black'] as const).map((mode) => ({
      key: mode,
      label: intl.formatMessage(messages[mode]),
      preset: null,
      mode,
      config: soapboxConfig,
    }));

    // A preset in the server's own color would duplicate one of the options above.
    const presets = themePresets
      .filter((preset) => preset.brandColor.toLowerCase() !== soapboxConfig.brandColor.toLowerCase())
      .map((preset) => ({
        key: preset.id,
        label: intl.formatMessage(presetMessages[preset.id]),
        preset: preset.id,
        mode: preset.mode,
        config: presetToSoapboxConfig(preset),
      }));

    return [...server, ...presets];
  }, [soapboxConfig, intl.locale]);

  const select = (option: ThemeOption) => {
    // Change both settings before saving, so it's saved once.
    dispatch({ type: SETTING_CHANGE, path: ['themePreset'], value: option.preset });
    dispatch(changeSetting(['themeMode'], option.mode));
  };

  return (
    <div
      role='radiogroup'
      aria-label={intl.formatMessage(messages.label)}
      className='overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_16px,black_calc(100%-16px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
    >
      <div className='mx-auto flex w-max gap-2 p-4'>
        {options.map((option) => (
          <Swatch
            key={option.key}
            option={option}
            isActive={(themePreset ?? null) === option.preset && themeMode === option.mode}
            onClick={() => select(option)}
          />
        ))}
      </div>
    </div>
  );
};

interface ISwatch {
  option: ThemeOption;
  isActive: boolean;
  onClick(): void;
}

const Swatch: React.FC<ISwatch> = ({ option, isActive, onClick }) => {
  const primary = option.config.colors.primary as Record<string, string> | undefined;

  return (
    <button
      type='button'
      role='radio'
      aria-checked={isActive}
      onClick={onClick}
      className='group w-[72px] shrink-0 text-center focus:outline-none'
    >
      <div
        className={clsx(
          'relative flex aspect-[4/3] overflow-hidden rounded-lg ring-1 transition group-focus-visible:ring-2 group-focus-visible:ring-primary-500',
          isActive ? 'ring-2 ring-gray-900 dark:ring-gray-100' : 'ring-gray-300 group-hover:ring-gray-500 dark:ring-gray-700',
        )}
      >
        {option.mode === 'system' ? (
          <>
            <Preview config={option.config} mode='light' />
            <Preview config={option.config} mode='dark' />
          </>
        ) : (
          <Preview config={option.config} mode={option.mode} />
        )}

        {isActive && (
          <div className='absolute bottom-1 right-1 flex size-4 items-center justify-center rounded-full text-white' style={{ backgroundColor: primary?.['500'] }}>
            <Icon src={checkIcon} className='size-3' aria-hidden />
          </div>
        )}
      </div>

      <span className={clsx('mt-1.5 block truncate text-xs', isActive ? 'font-medium text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-500')}>
        {option.label}
      </span>
    </button>
  );
};

/** Miniature of the interface in the given colors and mode. */
const Preview: React.FC<{ config: SoapboxConfig; mode: ThemeMode }> = ({ config, mode }) => {
  const primary = config.colors.primary as Record<string, string> | undefined;
  const gray = config.colors.gray as Record<string, string> | undefined;

  const background = { light: '#fff', dark: primary?.['900'], black: '#000' }[mode];
  const line = mode === 'light' ? gray?.['300'] : gray?.['700'];

  return (
    <div className='min-w-0 flex-1 space-y-1 p-2' style={{ backgroundColor: background }}>
      <div className='h-1 w-3/4 rounded-full' style={{ backgroundColor: line }} />
      <div className='h-1 w-1/2 rounded-full' style={{ backgroundColor: line }} />
      <div className='!mt-2 h-2.5 w-7 max-w-full rounded-full' style={{ backgroundColor: primary?.['500'] }} />
    </div>
  );
};

export default ThemePicker;
