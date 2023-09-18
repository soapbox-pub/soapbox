import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { Stack, Text } from 'soapbox/components/ui';

const messages = defineMessages({
  title: { id: 'chat_search.empty_results_blankslate.title', defaultMessage: 'No matches found' },
  body: { id: 'chat_search.empty_results_blankslate.body', defaultMessage: 'Try searching for another name.' },
});

const EmptyResultsBlankslate = () => {
  const intl = useIntl();

  return (
    <Stack justifyContent='center' alignItems='center' space={2} className='mx-auto h-full w-2/3'>
      <Text weight='bold' size='lg' align='center' data-testid='no-results'>
        {intl.formatMessage(messages.title)}
      </Text>

      <Text theme='muted' align='center'>
        {intl.formatMessage(messages.body)}
      </Text>
    </Stack>
  );
};

export default EmptyResultsBlankslate;