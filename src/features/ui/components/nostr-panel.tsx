import React from 'react';
import { FormattedMessage } from 'react-intl';

import CopyableInput from 'soapbox/components/copyable-input';
import { Text, Widget } from 'soapbox/components/ui';
import { useInstance } from 'soapbox/hooks/useInstance';

const NostrPanel = () => {
  const instance = useInstance();
  const relay = instance.nostr?.relay;

  if (!relay) {
    return null;
  }

  return (
    <Widget title={<FormattedMessage id='nostr_panel.title' defaultMessage='Nostr Relay' />}>
      <Text>
        <FormattedMessage id='nostr_panel.message' defaultMessage='Connect with any Nostr client.' />
      </Text>

      <CopyableInput value={relay} />
    </Widget>
  );
};

export default NostrPanel;
