import React from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Text, Widget } from 'soapbox/components/ui';
import { useInstance, useSoapboxConfig } from 'soapbox/hooks';

import SiteWallet from './site-wallet';

const messages = defineMessages({
  actionTitle: { id: 'crypto_donate_panel.actions.view', defaultMessage: 'Click to see {count, plural, one {# wallet} other {# wallets}}' },
});

interface ICryptoDonatePanel {
  limit: number
}

const CryptoDonatePanel: React.FC<ICryptoDonatePanel> = ({ limit = 3 }): JSX.Element | null => {
  const intl = useIntl();
  const history = useHistory();
  const instance = useInstance();

  const addresses = useSoapboxConfig().get('cryptoAddresses');

  if (limit === 0 || addresses.size === 0) {
    return null;
  }

  const handleAction = () => {
    history.push('/donate/crypto');
  };

  return (
    <Widget
      title={<FormattedMessage id='crypto_donate_panel.heading' defaultMessage='Donate Cryptocurrency' />}
      onActionClick={handleAction}
      actionTitle={intl.formatMessage(messages.actionTitle, { count: addresses.size })}
    >
      <Text>
        <FormattedMessage
          id='crypto_donate_panel.intro.message'
          defaultMessage='{siteTitle} accepts cryptocurrency donations to fund our service. Thank you for your support!'
          values={{ siteTitle: instance.title }}
        />
      </Text>

      <SiteWallet limit={limit} />
    </Widget>
  );
};

export default CryptoDonatePanel;
