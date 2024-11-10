import { FormattedMessage } from 'react-intl';

import Button from 'soapbox/components/ui/button.tsx';
import { Card, CardTitle } from 'soapbox/components/ui/card.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';

/** Prompts logged-out users to log in when viewing a thread. */
const ThreadLoginCta: React.FC = () => {
  const { instance } = useInstance();
  const { displayCta } = useSoapboxConfig();

  if (!displayCta) return null;

  return (
    <Card className='space-y-6 px-6 py-12 text-center' variant='rounded'>
      <Stack>
        <CardTitle title={<FormattedMessage id='thread_login.title' defaultMessage='Continue the conversation' />} />
        <Text>
          <FormattedMessage
            id='thread_login.message'
            defaultMessage='Become a part of the {siteTitle} community.'
            values={{ siteTitle: instance.title }}
          />
        </Text>
      </Stack>

      <Stack space={4} className='mx-auto max-w-xs'>
        <Button theme='tertiary' to='/login' block>
          <FormattedMessage id='thread_login.login' defaultMessage='Log in' />
        </Button>
        <Button to='/signup' block>
          <FormattedMessage id='thread_login.signup' defaultMessage='Sign up' />
        </Button>
      </Stack>
    </Card>
  );
};

export default ThreadLoginCta;
