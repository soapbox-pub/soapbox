import React from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import { useMediaProxyCache } from 'soapbox/api/hooks/admin';
import ScrollableList from 'soapbox/components/scrollable-list';
import { Button, CardTitle, Column, Form, HStack, Input, Stack, Text } from 'soapbox/components/ui';
import { useTextField } from 'soapbox/hooks/forms';
import toast from 'soapbox/toast';

const messages = defineMessages({
  heading: { id: 'column.admin.media_proxy_cache', defaultMessage: 'Media Proxy cache' },
  emptyMessage: { id: 'admin.media_proxy_cache.empty_message', defaultMessage: 'There are no banned URLs.' },
  label: { id: 'admin.media_proxy_cache.purge.action', defaultMessage: 'URL to be evicted' },
  purgeSuccess: { id: 'admin.media_proxy_cache.purge.success', defaultMessage: 'URL evicted' },
  purgeFail: { id: 'admin.media_proxy_cache.purge.fail', defaultMessage: 'Failed to evict URL' },
  unbanSuccess: { id: 'admin.media_proxy_cache.unban.success', defaultMessage: 'URL ban deleted' },
});

interface IBannedUrl {
  url: string;
}

const BannedUrl: React.FC<IBannedUrl> = ({ url }) => {
  const { unbanUrls } = useMediaProxyCache();

  const handleUnbanUrl = () => () => {
    unbanUrls({ urls: [url] }, {
      onSuccess: () => {
        toast.success(messages.unbanSuccess);
      },
    });
  };

  return (
    <div className='rounded-lg bg-gray-100 p-4 dark:bg-primary-800'>
      <Stack space={2}>
        <Text size='sm'>
          {url}
        </Text>
        <HStack justifyContent='end' space={2}>
          <Button theme='primary' onClick={handleUnbanUrl()}>
            <FormattedMessage id='admin.media_proxy_cache.unban' defaultMessage='Unban' />
          </Button>
        </HStack>
      </Stack>
    </div>
  );
};

const PurgeUrlForm: React.FC = () => {
  const intl = useIntl();

  const name = useTextField();

  const { purgeUrls, isPurging } = useMediaProxyCache();

  const handleSubmit = (e: React.FormEvent<Element>) => {
    e.preventDefault();
    purgeUrls({ urls: [name.value], ban: true }, {
      onSuccess() {
        toast.success(messages.purgeSuccess);
      },
      onError() {
        toast.error(messages.purgeFail);
      },
    });
  };

  const label = intl.formatMessage(messages.label);

  return (
    <Form onSubmit={handleSubmit}>
      <HStack space={2} alignItems='center'>
        <label className='grow'>
          <span style={{ display: 'none' }}>{label}</span>

          <Input
            type='text'
            placeholder={label}
            disabled={isPurging}
            {...name}
          />
        </label>

        <Button
          disabled={isPurging}
          onClick={handleSubmit}
          theme='primary'
        >
          <FormattedMessage id='admin.media_proxy_cache.purge.action' defaultMessage='Evict URL' />
        </Button>
      </HStack>
    </Form>
  );
};

const MediaProxyCache = () => {
  const intl = useIntl();

  const {
    data,
    hasNextPage,
    isLoading,
    fetchNextPage,
  } = useMediaProxyCache();

  const showLoading = isLoading && data.length === 0;

  const handleLoadMore = () => {
    fetchNextPage();
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4}>
        <PurgeUrlForm />

        <CardTitle title={<FormattedMessage id='admin.media_proxy_cache.banned_urls' defaultMessage='Banned URLs:' />} />

        <ScrollableList
          isLoading={isLoading}
          showLoading={showLoading}
          scrollKey='media-proxy-banned-urls'
          emptyMessage={intl.formatMessage(messages.emptyMessage)}
          hasMore={hasNextPage}
          onLoadMore={handleLoadMore}
          itemClassName='py-3 first:pt-0 last:pb-0'
        >
          {data.map(item => item && (
            <BannedUrl key={item} url={item} />
          ))}
        </ScrollableList>
      </Stack>
    </Column>
  );
};

export default MediaProxyCache;
