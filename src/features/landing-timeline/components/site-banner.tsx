import DOMPurify from 'isomorphic-dompurify';

import Markup from '@/components/markup.tsx';
import Stack from '@/components/ui/stack.tsx';
import { useInstance } from '@/hooks/useInstance.ts';
import { getTextDirection } from '@/utils/rtl.ts';

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
        direction={getTextDirection(description)}
        html={{ __html: description }}
      />
    </Stack>
  );
};

export { SiteBanner };