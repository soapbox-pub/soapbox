import React from 'react';

import IconPickerDropdown from './icon-picker-dropdown';

interface IIconPicker {
  value: string
  onChange: React.ChangeEventHandler
}

const IconPicker: React.FC<IIconPicker> = ({ value, onChange }) => {
  return (
    <div className='relative mt-1 rounded-md border border-solid border-gray-300 shadow-sm dark:border-gray-600 dark:bg-gray-800'>
      <IconPickerDropdown value={value} onPickEmoji={onChange} />
    </div>
  );
};

export default IconPicker;
