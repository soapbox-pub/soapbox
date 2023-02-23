import React, { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import List, { ListItem } from 'soapbox/components/list';
import { HStack, Text, Column, FormActions, Button, Stack, Icon } from 'soapbox/components/ui';
import { unregisterSw } from 'soapbox/utils/sw';

import Indicator from './components/indicator';

const messages = defineMessages({
  heading: { id: 'column.developers.service_worker', defaultMessage: 'Service Worker' },
  status: { id: 'sw.status', defaultMessage: 'Status' },
  url: { id: 'sw.url', defaultMessage: 'Script URL' },
});

/** Hook that returns the active ServiceWorker registration. */
const useRegistration = () => {
  const [isLoading, setLoading] = useState(true);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>();

  const isSupported = 'serviceWorker' in navigator;

  useEffect(() => {
    if (isSupported) {
      navigator.serviceWorker.getRegistration()
        .then(r => {
          setRegistration(r);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return {
    isLoading,
    registration,
  };
};

interface IServiceWorkerInfo {
}

/** Mini ServiceWorker debugging component. */
const ServiceWorkerInfo: React.FC<IServiceWorkerInfo> = () => {
  const intl = useIntl();
  const { isLoading, registration } = useRegistration();

  const url = registration?.active?.scriptURL;

  const getState = () => {
    if (registration?.waiting) {
      return 'pending';
    } else if (registration?.active) {
      return 'active';
    } else {
      return 'inactive';
    }
  };

  const getMessage = () => {
    if (isLoading) {
      return (
        <FormattedMessage
          id='sw.state.loading'
          defaultMessage='Loading…'
        />
      );
    } else if (!isLoading && !registration) {
      return (
        <FormattedMessage
          id='sw.state.unavailable'
          defaultMessage='Unavailable'
        />
      );
    } else if (registration?.waiting) {
      return (
        <FormattedMessage
          id='sw.state.waiting'
          defaultMessage='Waiting'
        />
      );
    } else if (registration?.active) {
      return (
        <FormattedMessage
          id='sw.state.active'
          defaultMessage='Active'
        />
      );
    } else {
      return (
        <FormattedMessage
          id='sw.state.unknown'
          defaultMessage='Unknown'
        />
      );
    }
  };

  const handleRestart = async() => {
    await unregisterSw();
    window.location.reload();
  };

  return (
    <Column label={intl.formatMessage(messages.heading)} backHref='/developers'>
      <Stack space={4}>
        <List>
          <ListItem label={intl.formatMessage(messages.status)}>
            <HStack alignItems='center' space={2}>
              <Indicator state={getState()} />
              <Text size='md' theme='muted'>{getMessage()}</Text>
            </HStack>
          </ListItem>

          {url && (
            <ListItem label={intl.formatMessage(messages.url)}>
              <a href={url} target='_blank' className='flex items-center space-x-1 truncate'>
                <span className='truncate'>{url}</span>
                <Icon
                  className='h-4 w-4'
                  src={require('@tabler/icons/external-link.svg')}
                />
              </a>
            </ListItem>
          )}
        </List>

        <FormActions>
          <Button theme='tertiary' type='button' onClick={handleRestart}>
            <FormattedMessage id='sw.restart' defaultMessage='Restart' />
          </Button>
        </FormActions>
      </Stack>
    </Column>
  );
};

export default ServiceWorkerInfo;