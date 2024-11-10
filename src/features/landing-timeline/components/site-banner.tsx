import DOMPurify from 'isomorphic-dompurify';

import Markup from 'soapbox/components/markup.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useInstance } from 'soapbox/hooks/index.ts';
import { getTextDirection } from 'soapbox/utils/rtl.ts';

import { LogoText } from './logo-text.tsx';

const SiteBanner: React.FC = () => {
  const { instance } = useInstance();
  const description = DOMPurify.sanitize(instance.description);

  return (
    <Stack space={3}>
      <LogoText dir={getTextDirection(instance.title)}>
        {instance.title}
      </LogoText>

      <Markup
        size='lg'
        dangerouslySetInnerHTML={{ __html: description }}
        direction={getTextDirection(description)}
      />
    </Stack>
  );
};

export { SiteBanner };