import ColorWithPicker from 'soapbox/features/soapbox-config/components/color-with-picker.tsx';

import type { ColorChangeHandler } from 'react-color';

interface IColor {
  color: string;
  onChange: (color: string) => void;
}

/** Color input. */
const Color: React.FC<IColor> = ({ color, onChange }) => {

  const handleChange: ColorChangeHandler = (result) => {
    onChange(result.hex);
  };

  return (
    <ColorWithPicker
      className='size-full'
      value={color}
      onChange={handleChange}
    />
  );
};

export default Color;