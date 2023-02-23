import React, { useState } from 'react';

import HStack from '../hstack/hstack';

import Tag from './tag';

interface ITagInput {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
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
    <div className='relative mt-1 grow shadow-sm'>
      <HStack
        className='block w-full rounded-md border-gray-400 bg-white p-2 pb-0 text-gray-900 placeholder:text-gray-600 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:ring-1 dark:ring-gray-800 dark:placeholder:text-gray-600 dark:focus:border-primary-500 dark:focus:ring-primary-500 sm:text-sm'
        space={2}
        wrap
      >
        {tags.map((tag, i) => (
          <div className='mb-2'>
            <Tag tag={tag} onDelete={handleTagDelete} />
          </div>
        ))}

        <input
          className='mb-2 h-8 w-32 grow bg-transparent p-1 outline-none'
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