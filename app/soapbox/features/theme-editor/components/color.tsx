import React from 'react';

import ColorWithPicker from 'soapbox/features/soapbox-config/components/color-with-picker';

import type { ColorChangeHandler } from 'react-color';

interface IColor {
  color: string
  onChange: (color: string) => void
}

/** Color input. */
const Color: React.FC<IColor> = ({ color, onChange }) => {

  const handleChange: ColorChangeHandler = (result) => {
    onChange(result.hex);
  };

  return (
    <ColorWithPicker
      className='h-full w-full'
      value={color}
      onChange={handleChange}
    />
  );
};

export default Color;