import React, { useEffect, useState } from 'react';

import { HStack, Stack, Slider } from 'soapbox/components/ui';
import { usePrevious } from 'soapbox/hooks';
import { compareId } from 'soapbox/utils/comparators';
import { hueShift } from 'soapbox/utils/theme';

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

  const [hue, setHue] = useState(0);
  const lastHue = usePrevious(hue);

  const handleChange = (tint: string) => {
    return (color: string) => {
      onChange({
        ...palette,
        [tint]: color,
      });
    };
  };

  useEffect(() => {
    const delta = hue - (lastHue || 0);

    const adjusted = Object.entries(palette).reduce<ColorGroup>((result, [tint, hex]) => {
      result[tint] = hueShift(hex, delta * 360);
      return result;
    }, {});

    onChange(adjusted);
  }, [hue]);

  return (
    <Stack className='w-full'>
      <HStack className='h-8 rounded-md overflow-hidden'>
        {tints.map(tint => (
          <Color color={palette[tint]} onChange={handleChange(tint)} />
        ))}
      </HStack>

      <Slider value={hue} onChange={setHue} />
    </Stack>
  );
};

export {
  Palette as default,
  ColorGroup,
};