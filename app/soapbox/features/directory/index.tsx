import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useLocation } from 'react-router-dom';

import { fetchDirectory, expandDirectory } from 'soapbox/actions/directory';
import LoadMore from 'soapbox/components/load-more';
import { Column, RadioButton, Stack, Text } from 'soapbox/components/ui';
import { useAppDispatch, useAppSelector, useFeatures, useInstance } from 'soapbox/hooks';

import AccountCard from './components/account-card';

const messages = defineMessages({
  title: { id: 'column.directory', defaultMessage: 'Browse profiles' },
  recentlyActive: { id: 'directory.recently_active', defaultMessage: 'Recently active' },
  newArrivals: { id: 'directory.new_arrivals', defaultMessage: 'New arrivals' },
  local: { id: 'directory.local', defaultMessage: 'From {domain} only' },
  federated: { id: 'directory.federated', defaultMessage: 'From known fediverse' },
});

const Directory = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const instance = useInstance();
  const features = useFeatures();

  const accountIds = useAppSelector((state) => state.user_lists.directory.items);
  const isLoading = useAppSelector((state) => state.user_lists.directory.isLoading);

  const [order, setOrder] = useState(params.get('order') || 'active');
  const [local, setLocal] = useState(!!params.get('local'));

  useEffect(() => {
    dispatch(fetchDirectory({ order: order || 'active', local: local || false }));
  }, [order, local]);

  const handleChangeOrder: React.ChangeEventHandler<HTMLInputElement> = e => {
    setOrder(e.target.value);
  };

  const handleChangeLocal: React.ChangeEventHandler<HTMLInputElement> = e => {
    setLocal(e.target.value === '1');
  };

  const handleLoadMore = () => {
    dispatch(expandDirectory({ order: order || 'active', local: local || false }));
  };

  return (
    <Column label={intl.formatMessage(messages.title)}>
      <Stack space={4}>
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <Text weight='medium'>Display filter</Text>
            <fieldset className='mt-3'>
              <legend className='sr-only'>Display filter</legend>
              <div className='space-y-2'>
                <RadioButton name='order' value='active' label={intl.formatMessage(messages.recentlyActive)} checked={order === 'active'} onChange={handleChangeOrder} />
                <RadioButton name='order' value='new' label={intl.formatMessage(messages.newArrivals)} checked={order === 'new'} onChange={handleChangeOrder} />
              </div>
            </fieldset>
          </div>

          {features.federating && (
            <div>
              <Text weight='medium'>Fediverse filter</Text>
              <fieldset className='mt-3'>
                <legend className='sr-only'>Fediverse filter</legend>
                <div className='space-y-2'>
                  <RadioButton name='local' value='1' label={intl.formatMessage(messages.local, { domain: instance.title })} checked={local} onChange={handleChangeLocal} />
                  <RadioButton name='local' value='0' label={intl.formatMessage(messages.federated)} checked={!local} onChange={handleChangeLocal} />
                </div>
              </fieldset>
            </div>
          )}
        </div>

        <div
          className={
            clsx({
              'grid grid-cols-1 sm:grid-cols-2 gap-2.5': true,
              'opacity-30': isLoading,
            })
          }
        >
          {accountIds.map((accountId) => (
            <AccountCard id={accountId} key={accountId} />),
          )}
        </div>

        <LoadMore onClick={handleLoadMore} disabled={isLoading} />
      </Stack>
    </Column>
  );
};

export default Directory;
