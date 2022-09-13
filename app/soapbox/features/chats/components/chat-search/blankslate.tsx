import React from 'react';

import { Stack, Text } from 'soapbox/components/ui';

const Blankslate = () => (
  <Stack justifyContent='center' alignItems='center' space={2} className='h-full w-2/3 mx-auto'>
    <Text weight='bold' size='lg' align='center'>Search followers</Text>
    <Text theme='muted' align='center'>
      You can start a conversation with anyone that follows you.
    </Text>
  </Stack>
);

export default Blankslate;