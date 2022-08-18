import React from 'react';

import { Button, Stack, Text } from 'soapbox/components/ui';

const Blankslate = () => (
  <Stack justifyContent='center' alignItems='center' space={4} className='px-4 h-full'>
    <Stack space={2}>
      <Text weight='semibold' size='xl' align='center'>No messages yet</Text>
      <Text theme='muted' align='center'>You can start a conversation with anyone that follows you.</Text>
    </Stack>

    {/* <Button theme='primary'>Message someone</Button> */}
  </Stack>
);

export default Blankslate;
