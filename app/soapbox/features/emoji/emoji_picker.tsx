import { Picker as EmojiPicker, PickerProps } from 'emoji-mart';
import React, { useRef, useEffect } from 'react';

import data from './data';

const getSpritesheetURL = (set: string) => {
  return '/packs/images/32.png';
}

const getImageURL = (set: string, name: string) => {
  console.log(set, name);

  return `/packs/emoji/${name}.svg`;
}

function Picker(props: PickerProps) {
  const ref = useRef(null);

  useEffect(() => {
    const input = { ...props, data, ref, getImageURL, getSpritesheetURL };

    new EmojiPicker(input);
  }, []);

  return <div ref={ref} />;
}

export {
  Picker,
};
