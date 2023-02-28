import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Stack, Text } from 'soapbox/components/ui';

export default () => (
  <Stack space={2} className='px-4 py-2' data-testid='no-results'>
    <Text weight='bold' size='lg'>
      <FormattedMessage
        id='groups.discover.search.no_results.title'
        defaultMessage='No matches found'
      />
    </Text>

    <Text theme='muted'>
      <FormattedMessage
        id='groups.discover.search.no_results.subtitle'
        defaultMessage='Try searching for another group.'
      />
    </Text>
  </Stack>
);