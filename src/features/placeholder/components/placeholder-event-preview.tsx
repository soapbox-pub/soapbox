import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';

import { generateText, randomIntFromInterval } from '../utils.ts';

const PlaceholderEventPreview = () => {
  const eventNameLength = randomIntFromInterval(5, 25);
  const nameLength = randomIntFromInterval(5, 15);

  return (
    <div className='relative w-full animate-pulse overflow-hidden rounded-lg bg-gray-100 text-primary-50 black:border black:border-gray-800 black:bg-black dark:bg-primary-800 dark:text-primary-800'>
      <div className='h-40 bg-primary-200 dark:bg-gray-600' />
      <Stack className='p-2.5' space={2}>
        <Text weight='semibold'>{generateText(eventNameLength)}</Text>

        <div className='flex flex-wrap gap-x-2 gap-y-1 text-gray-700 dark:text-gray-600'>
          <span>{generateText(nameLength)}</span>
          <span>{generateText(nameLength)}</span>
          <span>{generateText(nameLength)}</span>
        </div>
      </Stack>
    </div>
  );
};

export default PlaceholderEventPreview;
