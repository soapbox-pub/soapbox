import React from 'react';

import ForkAwesomeIcon from 'soapbox/components/fork-awesome-icon';
import { Widget, Stack, Text } from 'soapbox/components/ui';
import { useInstance, useSettings, useSoapboxConfig } from 'soapbox/hooks';

const PromoPanel: React.FC = () => {
  const instance = useInstance();
  const { promoPanel } = useSoapboxConfig();
  const settings = useSettings();

  const promoItems = promoPanel.get('items');
  const locale = settings.get('locale');

  if (!promoItems || promoItems.isEmpty()) return null;

  return (
    <Widget title={instance.title}>
      <Stack space={2}>
        {promoItems.map((item, i) => (
          <Text key={i}>
            <a className='flex items-center' href={item.url} target='_blank'>
              <ForkAwesomeIcon id={item.icon} className='mr-2 flex-none text-lg rtl:ml-2 rtl:mr-0' fixedWidth />
              {item.textLocales.get(locale) || item.text}
            </a>
          </Text>
        ))}
      </Stack>
    </Widget>
  );
};

export default PromoPanel;
