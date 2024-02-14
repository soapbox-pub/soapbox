import React from 'react';

import { useAccountLookup } from 'soapbox/api/hooks';
import Stack from 'soapbox/components/ui/stack/stack';

interface IAccountStep {
  username: string;
}

const AccountStep: React.FC<IAccountStep> = ({ username }) => {
  const { account } = useAccountLookup(username);

  return (
    <Stack space={3}>
      {JSON.stringify(account, null, 2)}
    </Stack>
  );
};

export default AccountStep;
