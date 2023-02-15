import React from 'react';

import { Emoji } from './emoji-picker-dropdown';
import ModifierPickerMenu from './modifier-picker-menu';

const backgroundImageFn = () => require('emoji-datasource/img/twitter/sheets/32.png');

interface IModifierPicker {
  active: boolean
  modifier?: number
  onOpen: () => void
  onClose: () => void
  onChange: (skinTone: number) => void
}

const ModifierPicker: React.FC<IModifierPicker> = ({ active, modifier, onOpen, onClose, onChange }) => {
  const handleClick = () => {
    if (active) {
      onClose();
    } else {
      onOpen();
    }
  };

  const handleSelect = (modifier: number) => {
    onChange(modifier);
    onClose();
  };

  return (
    <div className='emoji-picker-dropdown__modifiers'>
      <Emoji emoji='thumbsup' set='twitter' size={22} sheetSize={32} skin={modifier} onClick={handleClick} backgroundImageFn={backgroundImageFn} />
      <ModifierPickerMenu active={active} onSelect={handleSelect} onClose={onClose} />
    </div>
  );
};

export default ModifierPicker;
