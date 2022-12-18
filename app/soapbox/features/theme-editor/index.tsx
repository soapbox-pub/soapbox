import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { v4 as uuidv4 } from 'uuid';

import { updateSoapboxConfig } from 'soapbox/actions/admin';
import { getHost } from 'soapbox/actions/instance';
import snackbar from 'soapbox/actions/snackbar';
import { fetchSoapboxConfig } from 'soapbox/actions/soapbox';
import List, { ListItem } from 'soapbox/components/list';
import { Button, Column, Form, FormActions } from 'soapbox/components/ui';
import DropdownMenuContainer from 'soapbox/containers/dropdown-menu-container';
import { useAppDispatch, useAppSelector, useSoapboxConfig } from 'soapbox/hooks';
import { download } from 'soapbox/utils/download';

import Palette, { ColorGroup } from './components/palette';

const messages = defineMessages({
  title: { id: 'admin.theme.title', defaultMessage: 'Theme' },
  saved: { id: 'theme_editor.saved', defaultMessage: 'Theme updated!' },
  export: { id: 'theme_editor.export', defaultMessage: 'Export theme' },
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
  const [resetKey, setResetKey] = useState(uuidv4());

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

  const resetTheme = () => {
    setResetKey(uuidv4());
    setTimeout(() => setColors(soapbox.colors.toJS() as any));
  };

  const updateTheme = async () => {
    const params = rawConfig.set('colors', colors).toJS();
    await dispatch(updateSoapboxConfig(params));
  };

  const exportTheme = () => {
    const data = JSON.stringify(colors, null, 2);
    download(data, 'theme.json');
  };

  const handleSubmit = async() => {
    setSubmitting(true);

    try {
      await dispatch(fetchSoapboxConfig(host));
      await updateTheme();
      dispatch(snackbar.success(intl.formatMessage(messages.saved)));
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
            label='Primary'
            palette={colors.primary}
            onChange={updateColors('primary')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label='Secondary'
            palette={colors.secondary}
            onChange={updateColors('secondary')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label='Accent'
            palette={colors.accent}
            onChange={updateColors('accent')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label='Gray'
            palette={colors.gray}
            onChange={updateColors('gray')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label='Success'
            palette={colors.success}
            onChange={updateColors('success')}
            resetKey={resetKey}
          />

          <PaletteListItem
            label='Danger'
            palette={colors.danger}
            onChange={updateColors('danger')}
            resetKey={resetKey}
          />
        </List>

        <FormActions>
          <DropdownMenuContainer
            items={[{
              text: intl.formatMessage(messages.export),
              action: exportTheme,
            }]}
          />
          <Button theme='secondary' onClick={resetTheme}>
            <FormattedMessage id='theme_editor.Reset' defaultMessage='Reset' />
          </Button>

          <Button type='submit' theme='primary' disabled={submitting}>
            <FormattedMessage id='theme_editor.save' defaultMessage='Save theme' />
          </Button>
        </FormActions>
      </Form>
    </Column>
  );
};

interface IPaletteListItem {
  label: React.ReactNode,
  palette: ColorGroup,
  onChange: (palette: ColorGroup) => void,
  resetKey?: string,
}

/** Palette editor inside a ListItem. */
const PaletteListItem: React.FC<IPaletteListItem> = ({ label, palette, onChange, resetKey }) => {
  return (
    <ListItem label={<div className='w-20'>{label}</div>}>
      <Palette palette={palette} onChange={onChange} resetKey={resetKey} />
    </ListItem>
  );
};

export default ThemeEditor;