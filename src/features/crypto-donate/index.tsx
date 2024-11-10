import { useState } from 'react';
import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import Accordion from 'soapbox/components/ui/accordion.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import { useInstance } from 'soapbox/hooks/useInstance.ts';

import SiteWallet from './components/site-wallet.tsx';

const messages = defineMessages({
  heading: { id: 'column.crypto_donate', defaultMessage: 'Donate Cryptocurrency' },
});

const CryptoDonate: React.FC = (): JSX.Element => {
  const intl = useIntl();
  const { instance } = useInstance();

  const [explanationBoxExpanded, toggleExplanationBox] = useState(true);

  return (
    <Column label={intl.formatMessage(messages.heading)} withHeader>
      <Stack space={5}>
        <Accordion
          headline={<FormattedMessage id='crypto_donate.explanation_box.title' defaultMessage='Sending cryptocurrency donations' />}
          expanded={explanationBoxExpanded}
          onToggle={toggleExplanationBox}
        >
          <FormattedMessage
            id='crypto_donate.explanation_box.message'
            defaultMessage='{siteTitle} accepts cryptocurrency donations. You may send a donation to any of the addresses below. Thank you for your support!'
            values={{ siteTitle: instance.title }}
          />
        </Accordion>

        <SiteWallet />
      </Stack>
    </Column>
  );
};

export default CryptoDonate;
