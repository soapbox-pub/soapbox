import { FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals.ts';
import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useRegistrationStatus } from 'soapbox/hooks/useRegistrationStatus.ts';

const SignUpPanel = () => {
  const { isOpen } = useRegistrationStatus();
  const me = useAppSelector((state) => state.me);
  const dispatch = useAppDispatch();

  if (me || !isOpen) return null;

  function getGreeting() {
    const hours = new Date().getHours();
    return hours < 12 ? 'GM' : 'Hey There';
  }

  return (
    <Stack space={2} data-testid='sign-up-panel'>
      <Stack>
        <Text size='lg' weight='bold'>
          <FormattedMessage id='signup_panel.greeting_title' defaultMessage='{greeting}! Welcome aboard!' values={{ greeting: getGreeting() }} />
        </Text>

        <Text size='sm' theme='muted'>
          <FormattedMessage id='login_panel.subtitle' defaultMessage='Dive into the best of social media!' />
        </Text>
      </Stack>

      <HStack space={2}>
        <Button
          theme='tertiary'
          onClick={() => dispatch(openModal('NOSTR_LOGIN'))}
          block
        >
          <FormattedMessage id='account.login' defaultMessage='Log in' />
        </Button>

        <Button
          theme='primary'
          onClick={() => dispatch(openModal('NOSTR_SIGNUP'))}
          block
        >
          <FormattedMessage id='account.register' defaultMessage='Sign up' />
        </Button>

      </HStack>

    </Stack>
  );
};

export default SignUpPanel;
