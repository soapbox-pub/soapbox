import EmojiPicker from 'emoji-picker-react';
import React, { useRef } from 'react';

// import { joinPublicPath } from 'soapbox/utils/static';

/*
const getSpritesheetURL = (set: string) => {
  return require('emoji-datasource/img/twitter/sheets/32.png');
};

const getImageURL = (set: string, name: string) => {
  return joinPublicPath(`/packs/emoji/${name}.svg`);
};
*/

const Picker: React.FC<any> = (props) => {
  const ref = useRef(null);

  /*
  useEffect(() => {
    const input = { ...props, ref, getImageURL, getSpritesheetURL };

    // new EmojiPicker(input);
  }, []);
*/

  return (
    <div ref={ref} >
      <EmojiPicker />
    </div>);
};

export default Picker;
