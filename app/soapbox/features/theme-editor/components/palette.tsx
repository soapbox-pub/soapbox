import React from 'react';

import compareId from 'soapbox/compare_id';
import { HStack } from 'soapbox/components/ui';
import ColorWithPicker from 'soapbox/features/soapbox_config/components/color-with-picker';

interface ColorGroup {
  [tint: string]: string,
}

interface IPalette {
  palette: ColorGroup,
}

/** Editable color palette. */
const Palette: React.FC<IPalette> = ({ palette }) => {
  const tints = Object.keys(palette).sort(compareId);

  const result = tints.map(tint => {
    const hex = palette[tint];

    return (
      <ColorWithPicker
        className='w-full h-full'
        value={hex}
        onChange={() => {}}
      />
    );
  });

  return (
    <HStack className='w-full h-8 rounded-md overflow-hidden'>
      {result}
    </HStack>
  );
};

export {
  Palette as default,
  ColorGroup,
};