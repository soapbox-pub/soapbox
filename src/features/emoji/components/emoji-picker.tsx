import { Picker as EmojiPicker } from 'emoji-mart';
import { useRef, useEffect } from 'react';

import data from '../data.ts';

const Picker: React.FC<any> = (props) => {
  const ref = useRef(null);

  useEffect(() => {
    const input = { ...props, data, ref };

    new EmojiPicker(input);
  }, []);

  return <div className='flex justify-center' ref={ref} />;
};

export default Picker;
