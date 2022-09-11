import React, { useState } from 'react';

import HStack from '../hstack/hstack';

import Tag from './tag';

interface ITagInput {
  tags: string[],
  onChange: (tags: string[]) => void,
  placeholder?: string,
}

/** Manage a list of tags. */
// https://blog.logrocket.com/building-a-tag-input-field-component-for-react/
const TagInput: React.FC<ITagInput> = ({ tags, onChange, placeholder }) => {
  const [input, setInput] = useState('');

  const handleTagDelete = (tag: string) => {
    onChange(tags.filter(item => item !== tag));
  };

  const handleKeyDown: React.KeyboardEventHandler = (e) => {
    const { key } = e;
    const trimmedInput = input.trim();

    if (key === 'Tab') {
      e.preventDefault();
    }

    if ([',', 'Tab', 'Enter'].includes(key) && trimmedInput.length && !tags.includes(trimmedInput)) {
      e.preventDefault();
      onChange([...tags, trimmedInput]);
      setInput('');
    }

    if (key === 'Backspace' && !input.length && tags.length) {
      e.preventDefault();
      const tagsCopy = [...tags];
      tagsCopy.pop();

      onChange(tagsCopy);
    }
  };

  return (
    <div className='mt-1 relative shadow-sm'>
      <HStack
        className='p-2 pb-0 text-gray-900 dark:text-gray-100 placeholder:text-gray-600 dark:placeholder:text-gray-600 block w-full sm:text-sm dark:ring-1 dark:ring-gray-800 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-500 dark:focus:border-primary-500 rounded-md bg-white dark:bg-gray-900 border-gray-400 dark:border-gray-800'
        space={2}
        wrap
      >
        {tags.map((tag, i) => (
          <div className='mb-2'>
            <Tag tag={tag} onDelete={handleTagDelete} />
          </div>
        ))}

        <input
          className='p-1 mb-2 h-8 flex-grow bg-transparent outline-none'
          value={input}
          placeholder={placeholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </HStack>
    </div>
  );
};

export default TagInput;