import React, { useState } from 'react';
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

  const [colors, setColors] = useState(soapbox.colors.toJS() as any);

  const updateColors = (key: string) => {
    return (newColors: any) => {
      setColors({
        ...colors,
        [key]: {
          ...colors[key],
          ...newColors,
        },
      });
    };
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
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