import React from 'react';

import { Stack } from 'soapbox/components/ui';

interface IExtensionStep {
  setStep: (step: number) => void;
}

const ExtensionStep: React.FC<IExtensionStep> = () => {
  return (
    <Stack>
      extension step
    </Stack>
  );
};

export default ExtensionStep;
