import Text from './text.tsx';

import type { Sizes as TextSizes } from './text.tsx';

interface IDivider {
  text?: string;
  textSize?: TextSizes;
}

/** Divider */
const Divider = ({ text, textSize = 'md' }: IDivider) => (
  <div className='relative' data-testid='divider'>
    <div className='absolute inset-0 flex items-center' aria-hidden='true'>
      <div className='w-full border-t-2 border-solid border-gray-100 black:border-t dark:border-gray-800' />
    </div>

    {text && (
      <div className='relative flex justify-center'>
        <span className='bg-white px-2 text-gray-700 dark:bg-primary-900 dark:text-gray-600' data-testid='divider-text'>
          <Text size={textSize} tag='span' theme='inherit'>{text}</Text>
        </span>
      </div>
    )}
  </div>
);

export default Divider;
