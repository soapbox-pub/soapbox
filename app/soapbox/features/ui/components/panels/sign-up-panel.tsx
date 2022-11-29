import React from 'react';
import { FormattedMessage } from 'react-intl';

import { Button, Stack, Text } from 'soapbox/components/ui';
import { useAppSelector, useInstance, useSoapboxConfig } from 'soapbox/hooks';

const SignUpPanel = () => {
  const instance = useInstance();
  const { singleUserMode } = useSoapboxConfig();
  const me = useAppSelector((state) => state.me);

  if (me || singleUserMode) return null;

  return (
    <Stack space={2}>
      <Stack>
        <Text size='lg' weight='bold'>
          <FormattedMessage id='signup_panel.title' defaultMessage='New to {site_title}?' values={{ site_title: instance.title }} />
        </Text>

        <Text theme='muted' size='sm'>
          <FormattedMessage id='signup_panel.subtitle' defaultMessage='Sign up now to discuss.' />
        </Text>
      </Stack>

      <Button theme='primary' block to='/signup'>
        <FormattedMessage id='account.register' defaultMessage='Sign up' />
      </Button>
    </Stack>
  );
};

export default SignUpPanel;
