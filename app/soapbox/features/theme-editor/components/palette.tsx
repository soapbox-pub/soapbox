import React from 'react';

import compareId from 'soapbox/compare_id';
import { HStack } from 'soapbox/components/ui';

import Color from './color';

interface ColorGroup {
  [tint: string]: string,
}

interface IPalette {
  palette: ColorGroup,
  onChange: (palette: ColorGroup) => void,
}

/** Editable color palette. */
const Palette: React.FC<IPalette> = ({ palette, onChange }) => {
  const tints = Object.keys(palette).sort(compareId);

  const handleChange = (tint: string) => {
    return (color: string) => {
      onChange({
        ...palette,
        [tint]: color,
      });
    };
  };

  return (
    <HStack className='w-full h-8 rounded-md overflow-hidden'>
      {tints.map(tint => (
        <Color color={palette[tint]} onChange={handleChange(tint)} />
      ))}
    </HStack>
  );
};

export {
  Palette as default,
  ColorGroup,
};