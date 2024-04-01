import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import { Button, Column, Form, FormActions, Stack } from 'soapbox/components/ui';

import RelayEditor, { RelayData } from './components/relay-editor';

const messages = defineMessages({
  title: { id: 'nostr_relays.title', defaultMessage: 'Relays' },
});

const NostrRelays = () => {
  const intl = useIntl();

  const [relays, setRelays] = useState<RelayData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = (): void => {
    setIsLoading(true);
    // Save relays
    setIsLoading(false);
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Form onSubmit={handleSubmit}>
        <Stack space={4}>
          <RelayEditor relays={relays} setRelays={setRelays} />

          <FormActions>
            <Button to='/settings' theme='tertiary'>
              <FormattedMessage id='common.cancel' defaultMessage='Cancel' />
            </Button>

            <Button theme='primary' type='submit' disabled={isLoading}>
              <FormattedMessage id='edit_profile.save' defaultMessage='Save' />
            </Button>
          </FormActions>
        </Stack>
      </Form>
    </Column>
  );
};

export default NostrRelays;
