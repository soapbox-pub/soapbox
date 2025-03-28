import { FormattedMessage } from 'react-intl';

import { Card } from 'soapbox/components/ui/card.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useInstance } from 'soapbox/hooks/useInstance.ts';

import ConsumerButton from './consumer-button.tsx';

interface IConsumersList {
}

/** Displays OAuth consumers to log in with. */
const ConsumersList: React.FC<IConsumersList> = () => {
  const { instance } = useInstance();
  const providers = instance.pleroma.oauth_consumer_strategies;

  if (providers.length > 0) {
    return (
      <Card className='bg-gray-50 p-4 black:bg-black dark:bg-primary-800 sm:rounded-xl'>
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
