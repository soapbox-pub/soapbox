import React from 'react';

import List, { ListItem } from './list';

interface IRadioGroup {
  onChange: React.ChangeEventHandler
  children: React.ReactElement<{ onChange: React.ChangeEventHandler }>[]
}

const RadioGroup = ({ onChange, children }: IRadioGroup) => {
  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, { onChange }),
  );

  return <List>{childrenWithProps}</List>;
};

interface IRadioItem {
  label: React.ReactNode
  hint?: React.ReactNode
  value: string
  checked: boolean
  onChange?: React.ChangeEventHandler
}

const RadioItem: React.FC<IRadioItem> = ({ label, hint, checked = false, onChange, value }) => {
  return (
    <ListItem label={label} hint={hint}>
      <input
        type='radio'
        checked={checked}
        onChange={onChange}
        value={value}
        className='h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500'
      />
    </ListItem>
  );
};

export {
  RadioGroup,
  RadioItem,
};