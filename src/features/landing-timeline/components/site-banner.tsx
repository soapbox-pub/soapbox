import React from 'react';

import Markup from 'soapbox/components/markup';
import { Stack } from 'soapbox/components/ui';
import { useInstance } from 'soapbox/hooks';

import { LogoText } from './logo-text';

const SiteBanner: React.FC = () => {
  const instance = useInstance();

  return (
    <Stack space={3}>
      <LogoText>{instance.title}</LogoText>

      <Markup
        size='lg'
        dangerouslySetInnerHTML={{ __html: instance.short_description || instance.description }}
      />
    </Stack>
  );
};

export { SiteBanner };