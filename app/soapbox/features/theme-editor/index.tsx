import React, { useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { updateSoapboxConfig } from 'soapbox/actions/admin';
import { getHost } from 'soapbox/actions/instance';
import snackbar from 'soapbox/actions/snackbar';
import { fetchSoapboxConfig } from 'soapbox/actions/soapbox';
import List, { ListItem } from 'soapbox/components/list';
import { Button, Column, Form, FormActions } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useSoapboxConfig } from 'soapbox/hooks';

import Palette, { ColorGroup } from './components/palette';

const messages = defineMessages({
  title: { id: 'admin.theme.title', defaultMessage: 'Theme' },
  saved: { id: 'theme_editor.saved', defaultMessage: 'Theme updated!' },
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

  const updateTheme = async () => {
    const params = rawConfig.set('colors', colors).toJS();
    await dispatch(updateSoapboxConfig(params));
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
          />

          <PaletteListItem
            label='Secondary'
            palette={colors.secondary}
            onChange={updateColors('secondary')}
          />

          <PaletteListItem
            label='Accent'
            palette={colors.accent}
            onChange={updateColors('accent')}
          />

          <PaletteListItem
            label='Gray'
            palette={colors.gray}
            onChange={updateColors('gray')}
          />

          <PaletteListItem
            label='Success'
            palette={colors.success}
            onChange={updateColors('success')}
          />

          <PaletteListItem
            label='Danger'
            palette={colors.danger}
            onChange={updateColors('danger')}
          />
        </List>

        <FormActions>
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
}

/** Palette editor inside a ListItem. */
const PaletteListItem: React.FC<IPaletteListItem> = ({ label, palette, onChange }) => {
  return (
    <ListItem label={<div className='w-20'>{label}</div>}>
      <Palette palette={palette} onChange={onChange} />
    </ListItem>
  );
};

export default ThemeEditor;