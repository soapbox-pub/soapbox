import React, { useEffect, useRef, useState } from 'react';

import { HStack, Stack, Slider } from 'soapbox/components/ui';
import { usePrevious } from 'soapbox/hooks';
import { Hsl, HslColorPalette } from 'soapbox/types/colors';
import { compareId } from 'soapbox/utils/comparators';
import { hexToHsl, hslShift, hslToHex } from 'soapbox/utils/theme';

import Color from './color';
import HSLToggler from './hsl-toggler';

interface ColorGroup {
  [tint: string]: string,
}

interface IPalette {
  palette: HslColorPalette,
  onChange: (palette: HslColorPalette) => void,
  resetKey?: string,
}

/** Editable color palette. */
const Palette: React.FC<IPalette> = ({ palette, onChange, resetKey }) => {
  const tints = Object.keys(palette).sort(compareId);

  const [hslKey, setHslKey] = useState<'h' | 's' | 'l'>('h');
  const [slider, setSlider] = useState(0);
  const lastSlider = usePrevious(slider);

  const skipUpdate = useRef(false);

  const handleChange = (tint: string) => {
    return (hex: string) => {
      onChange({
        ...palette,
        [tint]: hexToHsl(hex)!,
      });
    };
  };

  useEffect(() => {
    if (skipUpdate.current) {
      skipUpdate.current = false;
      return;
    }

    const delta = slider - (lastSlider || 0);

    const adjusted = Object.entries(palette).reduce<HslColorPalette>((result, [tint, hsl]) => {
      result[tint] = hslShift(hsl as Hsl, {
        h: hslKey === 'h' ? delta * 360 : 0,
        s: hslKey === 's' ? delta * 200 : 0,
        l: hslKey === 'l' ? delta * 200 : 0,
      });
      return result;
    }, {});

    onChange(adjusted);
  }, [slider]);

  useEffect(() => {
    skipUpdate.current = true;
    if (['s', 'l'].includes(hslKey)) {
      setSlider(0.5);
    } else {
      setSlider(0);
    }
  }, [resetKey, hslKey]);

  return (
    <Stack space={1} className='w-full'>
      <HStack className='h-8 rounded-md overflow-hidden'>
        {tints.map(tint => (
          <Color color={hslToHex(palette[tint] as Hsl)} onChange={handleChange(tint)} />
        ))}
      </HStack>

      <HStack space={2}>
        <Slider value={slider} onChange={setSlider} />
        <HSLToggler value={hslKey} onChange={setHslKey} />
      </HStack>
    </Stack>
  );
};

export {
  Palette as default,
  ColorGroup,
};