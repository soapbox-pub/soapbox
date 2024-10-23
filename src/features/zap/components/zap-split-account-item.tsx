import clsx from 'clsx';
import React, { useState } from 'react';

import { Slider } from 'soapbox/components/ui';

const formattedWeight = (weight: number) =>{
  return Number((weight * 100).toFixed());
};

interface IZapSplitSlider {
  width?: string;
  initialWeight: number;
  onWeightChange: (newWeight: number) => void;
}

export const ZapSplitSlider: React.FC<IZapSplitSlider> = ({ initialWeight, onWeightChange, width = 'w-40' }) => {
  const [value, setValue] = useState(initialWeight / 100);

  const handleChange = (newValue: number) => {
    setValue(newValue);
    onWeightChange(Number((newValue * 100).toFixed()));
  };

  return (
    <div className={clsx('flex flex-col', width)}>
      {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
      {formattedWeight(value)}%
      <Slider
        value={value}
        onChange={(v) => {
          handleChange(v);
        }}
      />
    </div>
  );
};