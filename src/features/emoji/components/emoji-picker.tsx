import spriteSheet from 'emoji-datasource/img/twitter/sheets/32.png';
import { Picker as EmojiPicker } from 'emoji-mart';
import { useRef, useEffect } from 'react';

import data from '../data.ts';

const getSpritesheetURL = () => spriteSheet;

const getImageURL = (_set: string, name: string) => {
  return `/packs/emoji/${name}.svg`;
};

const Picker: React.FC<any> = (props) => {
  const ref = useRef(null);

  useEffect(() => {
    const input = { ...props, data, ref, getImageURL, getSpritesheetURL };

    new EmojiPicker(input);
  }, []);

  return <div className='flex justify-center' ref={ref} />;
};

export default Picker;
