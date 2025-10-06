import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button.tsx';
import { Card, CardTitle } from '@/components/ui/card.tsx';
import Stack from '@/components/ui/stack.tsx';
import Text from '@/components/ui/text.tsx';
import { useInstance } from '@/hooks/useInstance.ts';
import { useSoapboxConfig } from '@/hooks/useSoapboxConfig.ts';

/** Prompts logged-out users to log in when viewing a thread. */
const ThreadLoginCta: React.FC = () => {
  const { instance } = useInstance();
  const { displayCta } = useSoapboxConfig();

  if (!displayCta) return null;

  return (
    <Card className='space-y-6 px-6 py-12 text-center'>
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
