import React from 'react';

import Text from '../text/text';

import type { Sizes as TextSizes } from '../text/text';

interface IDivider {
  text?: string
  textSize?: TextSizes
}

/** Divider */
const Divider = ({ text, textSize = 'md' }: IDivider) => (
  <div className='relative' data-testid='divider'>
    <div className='absolute inset-0 flex items-center' aria-hidden='true'>
      <div className='w-full border-t-2 border-gray-100 dark:border-gray-800 border-solid' />
    </div>

    {text && (
      <div className='relative flex justify-center'>
        <span className='px-2 bg-white dark:bg-gray-900 text-gray-400' data-testid='divider-text'>
          <Text size={textSize} tag='span' theme='inherit'>{text}</Text>
        </span>
      </div>
    )}
  </div>
);

export default Divider;
