import { HStack, Stack, Text } from 'soapbox/components/ui/index.ts';

import { generateText, randomIntFromInterval } from '../utils.ts';

export default ({ withJoinAction = true }: { withJoinAction?: boolean }) => {
  const groupNameLength = randomIntFromInterval(12, 20);

  return (
    <HStack
      alignItems='center'
      justifyContent='between'
      className='animate-pulse'
    >
      <HStack alignItems='center' space={2} className='overflow-hidden'>
        {/* Group Avatar */}
        <div className='size-11 rounded-full bg-gray-500 dark:bg-gray-700 dark:ring-primary-900' />

        <Stack className='text-gray-500 dark:text-gray-700'>
          <Text theme='inherit' weight='bold'>
            {generateText(groupNameLength)}
          </Text>

          <HStack space={1} alignItems='center'>
            <Text theme='inherit' tag='span' size='sm' weight='medium'>
              {generateText(6)}
            </Text>

            {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
            <span>&bull;</span>

            <Text theme='inherit' tag='span' size='sm' weight='medium'>
              {generateText(6)}
            </Text>
          </HStack>
        </Stack>
      </HStack>

      {/* Join Group Button */}
      {withJoinAction && (
        <div className='h-10 w-36 rounded-full bg-gray-300 dark:bg-gray-800' />
      )}
    </HStack>
  );
};
