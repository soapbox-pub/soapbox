import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list';
import { Column } from 'soapbox/components/ui';
import { useSoapboxConfig } from 'soapbox/hooks';

import Palette, { ColorGroup } from './components/palette';

const messages = defineMessages({
  title: { id: 'admin.theme.title', defaultMessage: 'Theme' },
});

interface IThemeEditor {
}

/** UI for editing Tailwind theme colors. */
const ThemeEditor: React.FC<IThemeEditor> = () => {
  const intl = useIntl();
  const soapbox = useSoapboxConfig();
  const colors = soapbox.colors.toJS();

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <List>
        <PaletteListItem
          label='Primary'
          palette={colors.primary as any}
        />

        <PaletteListItem
          label='Secondary'
          palette={colors.secondary as any}
        />

        <PaletteListItem
          label='Accent'
          palette={colors.accent as any}
        />

        <PaletteListItem
          label='Gray'
          palette={colors.gray as any}
        />

        <PaletteListItem
          label='Success'
          palette={colors.success as any}
        />

        <PaletteListItem
          label='Danger'
          palette={colors.danger as any}
        />
      </List>
    </Column>
  );
};

interface IPaletteListItem {
  label: React.ReactNode,
  palette: ColorGroup,
}

/** Palette editor inside a ListItem. */
const PaletteListItem: React.FC<IPaletteListItem> = ({ label, palette }) => {
  return (
    <ListItem label={<div className='w-20'>{label}</div>}>
      <Palette palette={palette} />
    </ListItem>
  );
};

export default ThemeEditor;