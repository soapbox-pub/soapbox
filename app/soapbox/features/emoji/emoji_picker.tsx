import { Picker as EmojiPicker, PickerProps } from 'emoji-mart';
import React, { useRef, useEffect } from 'react';

import data from './data';

function Picker(props: PickerProps) {
  const ref = useRef(null);

  useEffect(() => {
    const input = { ...props, data, ref };

    new EmojiPicker(input);
  }, []);

  return <div ref={ref} />;
}

export {
  Picker,
};
