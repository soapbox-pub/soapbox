import { FormattedMessage } from 'react-intl';

import Button from '@/components/ui/button.tsx';
import HStack from '@/components/ui/hstack.tsx';
import Stack from '@/components/ui/stack.tsx';
import Text from '@/components/ui/text.tsx';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { useInstance } from '@/hooks/useInstance.ts';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus.ts';

const SignUpPanel = () => {
  const { instance } = useInstance();
  const { isOpen } = useRegistrationStatus();
  const me = useAppSelector((state) => state.me);

  if (me || !isOpen) return null;

  return (
    <Stack space={2} data-testid='sign-up-panel'>
      <Stack>
        <Text size='lg' weight='bold'>
          <FormattedMessage id='signup_panel.title' defaultMessage='New to {site_title}?' values={{ site_title: instance.title }} />
        </Text>

        <Text size='sm' theme='muted'>
          <FormattedMessage id='signup_panel.subtitle' defaultMessage="Sign up now to discuss what's happening." />
        </Text>
      </Stack>

      <HStack space={2}>
        <Button
          theme='tertiary'
          to='/login'
          block
        >
          <FormattedMessage id='account.login' defaultMessage='Log in' />
        </Button>

        <Button
          theme='primary'
          to='/signup'
          block
        >
          <FormattedMessage id='account.register' defaultMessage='Sign up' />
        </Button>

      </HStack>

    </Stack>
  );
};

export default SignUpPanel;
