import data from '@emoji-mart/data';
import { Picker as EmojiPicker } from 'emoji-mart';
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

export default function Picker(props) {
  const ref = useRef();

  useEffect(() => {
    const input = { ...props, data, ref };

    new EmojiPicker(input);
  }, []);

  return <div ref={ref} />;
}
