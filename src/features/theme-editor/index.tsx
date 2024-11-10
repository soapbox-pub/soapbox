import downloadIcon from '@tabler/icons/outline/download.svg';
import refreshIcon from '@tabler/icons/outline/refresh.svg';
import uploadIcon from '@tabler/icons/outline/upload.svg';
import { useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { updateSoapboxConfig } from 'soapbox/actions/admin.ts';
import { getHost } from 'soapbox/actions/instance.ts';
import { fetchSoapboxConfig } from 'soapbox/actions/soapbox.ts';
import DropdownMenu from 'soapbox/components/dropdown-menu/index.ts';
import List, { ListItem } from 'soapbox/components/list.tsx';
import { Button, Column, Form, FormActions } from 'soapbox/components/ui/index.ts';
import ColorWithPicker from 'soapbox/features/soapbox-config/components/color-with-picker.tsx';
import { useAppDispatch, useAppSelector, useSoapboxConfig } from 'soapbox/hooks/index.ts';
import { normalizeSoapboxConfig } from 'soapbox/normalizers/index.ts';
import toast from 'soapbox/toast.tsx';
import { download } from 'soapbox/utils/download.ts';

import Palette, { ColorGroup } from './components/palette.tsx';

import type { ColorChangeHandler } from 'react-color';

const messages = defineMessages({
  title: { id: 'admin.theme.title', defaultMessage: 'Theme' },
  saved: { id: 'theme_editor.saved', defaultMessage: 'Theme updated!' },
  restore: { id: 'theme_editor.restore', defaultMessage: 'Restore default theme' },
  export: { id: 'theme_editor.export', defaultMessage: 'Export theme' },
  import: { id: 'theme_editor.import', defaultMessage: 'Import theme' },
  importSuccess: { id: 'theme_editor.import_success', defaultMessage: 'Theme was successfully imported!' },
  colorPrimary: { id: 'theme_editor.colors.primary', defaultMessage: 'Primary' },
  colorSecondary: { id: 'theme_editor.colors.secondary', defaultMessage: 'Secondary' },
  colorAccent: { id: 'theme_editor.colors.accent', defaultMessage: 'Accent' },
  colorGray: { id: 'theme_editor.colors.gray', defaultMessage: 'Gray' },
  colorSuccess: { id: 'theme_editor.colors.success', defaultMessage: 'Success' },
  colorDanger: { id: 'theme_editor.colors.danger', defaultMessage: 'Danger' },
  colorGreentext: { id: 'theme_editor.colors.greentext', defaultMessage: 'Greentext' },
  colorAccentBlue: { id: 'theme_editor.colors.accent_blue', defaultMessage: 'Accent Blue' },
  colorGradientStart: { id: 'theme_editor.colors.gradient_start', defaultMessage: 'Gradient Start' },
  colorGradientEnd: { id: 'theme_editor.colors.gradient_end', defaultMessage: 'Gradient End' },
});

interface IThemeEditor {
}

/** UI for editing Tailwind theme colors. */
const ThemeEditor: React.FC<IThemeEditor> = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const soapbox = useSoapboxConfig();
  const host = useAppSelector(state => getHost(state));
  const rawConfig = useAppSelector(state => state.soapbox);

  const [colors, setColors] = useState(soapbox.colors.toJS() as any);
  const [submitting, setSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(crypto.randomUUID());

  const fileInput = useRef<HTMLInputElement>(null);

  const updateColors = (key: string) => {
    return (newColors: ColorGroup) => {
      setColors({
        ...colors,
        [key]: {
          ...colors[key],
          ...newColors,
        },
      });
    };
  };

  const updateColor = (key: string) => {
    return (hex: string) => {
      setColors({
        ...colors,
        [key]: hex,
      });
    };
  };

  const setTheme = (theme: any) => {
    setResetKey(crypto.randomUUID());
    setTimeout(() => setColors(theme));
  };

  const resetTheme = () => {
    setTheme(soapbox.colors.toJS() as any);
  };

  const updateTheme = async () => {
    const params = rawConfig.set('colors', colors).toJS();
    await dispatch(updateSoapboxConfig(params));
  };

  const restoreDefaultTheme = () => {
    const colors = normalizeSoapboxConfig({ brandColor: '#0482d8' }).colors.toJS();
    setTheme(colors);
  };

  const exportTheme = () => {
    const data = JSON.stringify(colors, null, 2);
    download(data, 'theme.json');
  };

  const importTheme = () => {
    fileInput.current?.click();
  };

  const handleSelectFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.item(0);

    if (file) {
      const text = await file.text();
      const json = JSON.parse(text);
      const colors = normalizeSoapboxConfig({ colors: json }).colors.toJS();

      setTheme(colors);
      toast.success(intl.formatMessage(messages.importSuccess));
    }
  };

  const handleSubmit = async() => {
    setSubmitting(true);

    try {
      await dispatch(fetchSoapboxConfig(host));
      await updateTheme();
      toast.success(intl.formatMessage(messages.saved));
      setSubmitting(false);
    } catch (e) {
      setSubmitting(false);
    }
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Form onSubmit={handleSubmit}>
        <List>
          <PaletteListItem
            label={intl.formatMessage(messages.colorPrimary)}
            palette={colors.primary}
            onChange={updateColors('primary')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorSecondary)}
            palette={colors.secondary}
            onChange={updateColors('secondary')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorAccent)}
            palette={colors.accent}
            onChange={updateColors('accent')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorGray)}
            palette={colors.gray}
            onChange={updateColors('gray')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorSuccess)}
            palette={colors.success}
            onChange={updateColors('success')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label={intl.formatMessage(messages.colorDanger)}
            palette={colors.danger}
            onChange={updateColors('danger')}
            resetKey={resetKey}
          />
        </List>

        <List>
          <ColorListItem
            label={intl.formatMessage(messages.colorGreentext)}
            value={colors.greentext}
            onChange={updateColor('greentext')}
          />

          <ColorListItem
            label={intl.formatMessage(messages.colorAccentBlue)}
            value={colors['accent-blue']}
            onChange={updateColor('accent-blue')}
          />

          <ColorListItem
            label={intl.formatMessage(messages.colorGradientStart)}
            value={colors['gradient-start']}
            onChange={updateColor('gradient-start')}
          />

          <ColorListItem
            label={intl.formatMessage(messages.colorGradientEnd)}
            value={colors['gradient-end']}
            onChange={updateColor('gradient-end')}
          />
        </List>

        <FormActions>
          <DropdownMenu
            items={[{
              text: intl.formatMessage(messages.restore),
              action: restoreDefaultTheme,
              icon: refreshIcon,
            }, {
              text: intl.formatMessage(messages.import),
              action: importTheme,
              icon: uploadIcon,
            }, {
              text: intl.formatMessage(messages.export),
              action: exportTheme,
              icon: downloadIcon,
            }]}
          />
          <Button theme='secondary' onClick={resetTheme}>
            <FormattedMessage id='theme_editor.reset' defaultMessage='Reset' />
          </Button>

          <Button type='submit' theme='primary' disabled={submitting}>
            <FormattedMessage id='theme_editor.save' defaultMessage='Save theme' />
          </Button>
        </FormActions>
      </Form>

      <input
        type='file'
        ref={fileInput}
        multiple
        accept='application/json'
        className='hidden'
        onChange={handleSelectFile}
      />
    </Column>
  );
};

interface IPaletteListItem {
  label: React.ReactNode;
  palette: ColorGroup;
  onChange: (palette: ColorGroup) => void;
  resetKey?: string;
}

/** Palette editor inside a ListItem. */
const PaletteListItem: React.FC<IPaletteListItem> = ({ label, palette, onChange, resetKey }) => {
  return (
    <ListItem label={<div className='w-20'>{label}</div>}>
      <Palette palette={palette} onChange={onChange} resetKey={resetKey} />
    </ListItem>
  );
};

interface IColorListItem {
  label: React.ReactNode;
  value: string;
  onChange: (hex: string) => void;
}

/** Single-color picker. */
const ColorListItem: React.FC<IColorListItem> = ({ label, value, onChange }) => {
  const handleChange: ColorChangeHandler = (color, _e) => {
    onChange(color.hex);
  };

  return (
    <ListItem label={label}>
      <ColorWithPicker
        value={value}
        onChange={handleChange}
        className='h-8 w-10 overflow-hidden rounded-md'
      />
    </ListItem>
  );
};

export default ThemeEditor;