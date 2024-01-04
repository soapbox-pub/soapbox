import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Card, HStack, Text } from 'soapbox/components/ui';
import { useInstance } from 'soapbox/hooks';

import ConsumerButton from './consumer-button';

interface IConsumersList {
}

/** Displays OAuth consumers to log in with. */
const ConsumersList: React.FC<IConsumersList> = () => {
  const instance = useInstance();
  const providers = instance.pleroma.oauth_consumer_strategies;

  if (providers.length > 0) {
    return (
      <Card className='bg-gray-50 p-4 sm:rounded-xl dark:bg-primary-800'>
        <Text size='xs' theme='muted'>
          <FormattedMessage id='oauth_consumers.title' defaultMessage='Other ways to sign in' />
        </Text>
        <HStack space={2}>
          {providers.map(provider => (
            <ConsumerButton provider={provider} />
          ))}
        </HStack>
      </Card>
    );
  } else {
    return null;
  }
};

export default ConsumersList;
