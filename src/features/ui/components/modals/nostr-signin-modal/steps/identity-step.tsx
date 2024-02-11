import React from 'react';

import { Stack } from 'soapbox/components/ui';

interface IIdentityStep {
  setStep: (step: number) => void;
}

const IdentityStep: React.FC<IIdentityStep> = () => {
  return (
    <Stack>
      identity step
    </Stack>
  );
};

export default IdentityStep;
