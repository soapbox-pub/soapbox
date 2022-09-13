import React from 'react';

import { Stack, Text } from 'soapbox/components/ui';

const EmptyResultsBlankslate = () => (
  <Stack justifyContent='center' alignItems='center' space={2} className='h-full w-2/3 mx-auto'>
    <Text weight='bold' size='lg' align='center'>No matches found</Text>
    <Text theme='muted' align='center'>
      Try searching for another name.
    </Text>
  </Stack>
);

export default EmptyResultsBlankslate;