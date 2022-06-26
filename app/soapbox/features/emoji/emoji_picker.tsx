import data from '@emoji-mart/data/sets/14/twitter.json'
import { Picker as EmojiPicker, PickerProps } from 'emoji-mart';
import React, { useRef, useEffect } from 'react';

// const categories = [
//   'recent',
//   'custom',
//   'people',
//   'nature',
//   'foods',
//   'activity',
//   'places',
//   'objects',
//   'symbols',
//   'flags',
// ];
//

function Picker(props: PickerProps) {
  const ref = useRef(null);

  useEffect(() => {
    const input = { ...props, data, ref };

    new EmojiPicker(input);
  }, []);

  return <div ref={ref} />;
}

export {
  Picker
}
