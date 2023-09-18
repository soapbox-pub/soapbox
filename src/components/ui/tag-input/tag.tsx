import React from 'react';

import IconButton from '../icon-button/icon-button';
import Text from '../text/text';

interface ITag {
  /** Name of the tag. */
  tag: string
  /** Callback when the X icon is pressed. */
  onDelete: (tag: string) => void
}

/** A single editable Tag (used by TagInput). */
const Tag: React.FC<ITag> = ({ tag, onDelete }) => {
  return (
    <div className='inline-flex items-center whitespace-nowrap rounded bg-primary-500 p-1'>
      <Text theme='white'>{tag}</Text>

      <IconButton
        iconClassName='h-4 w-4'
        src={require('@tabler/icons/x.svg')}
        onClick={() => onDelete(tag)}
      />
    </div>
  );
};

export default Tag;