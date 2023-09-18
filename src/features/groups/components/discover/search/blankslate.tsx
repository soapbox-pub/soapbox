import React from 'react';

import { Stack, Text } from 'soapbox/components/ui';

interface Props {
  title: React.ReactNode | string
  subtitle: React.ReactNode | string
}

export default ({ title, subtitle }: Props) => (
  <Stack space={2} className='px-4 py-2' data-testid='no-results'>
    <Text weight='bold' size='lg'>
      {title}
    </Text>

    <Text theme='muted'>
      {subtitle}
    </Text>
  </Stack>
);