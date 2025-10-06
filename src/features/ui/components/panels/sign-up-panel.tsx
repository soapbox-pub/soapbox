import { FormattedMessage } from 'react-intl';

import { openModal } from '@/actions/modals.ts';
import Button from '@/components/ui/button.tsx';
import HStack from '@/components/ui/hstack.tsx';
import Stack from '@/components/ui/stack.tsx';
import Text from '@/components/ui/text.tsx';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useAppSelector } from '@/hooks/useAppSelector.ts';
import { useFeatures } from '@/hooks/useFeatures.ts';
import { useInstance } from '@/hooks/useInstance.ts';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus.ts';

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
