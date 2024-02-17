import React from 'react';
import { FormattedMessage } from 'react-intl';

import { nostrExtensionLogIn } from 'soapbox/actions/nostr';
import Stack from 'soapbox/components/ui/stack/stack';
import Text from 'soapbox/components/ui/text/text';
import { useAppDispatch } from 'soapbox/hooks';

const NostrExtensionIndicator: React.FC = () => {
  const dispatch = useAppDispatch();

  const onClick = () => dispatch(nostrExtensionLogIn());

  return (
    <Stack space={2} className='rounded-lg bg-gray-100 p-2 dark:bg-gray-800'>
      <Text size='xs'>
        {window.nostr ? (
          <FormattedMessage
            id='nostr_extension.found'
            defaultMessage='<link>Sign in</link> with browser extension.'
            values={{
              link: (node) => <button className='underline' onClick={onClick}>{node}</button>,
            }}
          />
        ) : (
          <FormattedMessage id='nostr_extension.not_found' defaultMessage='Browser extension not found.' />
        )}
      </Text>
    </Stack>
  );
};

export default NostrExtensionIndicator;