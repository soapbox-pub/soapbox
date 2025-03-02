import { FormattedMessage } from 'react-intl';

import { openModal } from 'soapbox/actions/modals.ts';
import Button from 'soapbox/components/ui/button.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { useRegistrationStatus } from 'soapbox/hooks/useRegistrationStatus.ts';

const SignUpPanel = () => {
  const { instance } = useInstance();
  const { nostrSignup } = useFeatures();
  const { isOpen } = useRegistrationStatus();
  const me = useAppSelector((state) => state.me);
  const dispatch = useAppDispatch();

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
          onClick={nostrSignup ? () => dispatch(openModal('NOSTR_LOGIN')) : undefined}
          to={nostrSignup ? undefined : '/login'}
          block
        >
          <FormattedMessage id='account.login' defaultMessage='Log in' />
        </Button>

        <Button
          theme='primary'
          onClick={nostrSignup ? () => dispatch(openModal('NOSTR_SIGNUP')) : undefined}
          to={nostrSignup ? undefined : '/signup'}
          block
        >
          <FormattedMessage id='account.register' defaultMessage='Sign up' />
        </Button>

      </HStack>

    </Stack>
  );
};

export default SignUpPanel;
