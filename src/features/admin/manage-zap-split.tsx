import React, { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Account from 'soapbox/components/account';
import List, { ListItem } from 'soapbox/components/list';
import { Button, Column, HStack, Stack } from 'soapbox/components/ui';

import { useManageZapSplit } from '../../api/hooks/admin/useManageZapSplit';
import AddNewAccount from '../ui/components/new-account-zap-split';
import { ZapSplitSlider } from '../zap/components/zap-split-account-item';

const closeIcon = require('@tabler/icons/outline/x.svg');

const messages = defineMessages({
  heading: { id: 'column.admin.zap_split', defaultMessage: 'Manage Zap Split' },
});

interface INewAccount{
  acc: string;
  message: string;
  weight: number;
}

const ManageZapSplit: React.FC = () => {
  const intl = useIntl();
  const { formattedData, weights, handleWeightChange, sendNewSplit, removeAccount } = useManageZapSplit();
  const [hasNewAccount, setHasNewAccount] = useState(false);
  const [newWeight, setNewWeight] = useState(0.05);
  const [newAccount, setNewAccount] = useState<INewAccount>({ acc: '', message: '', weight: Number((newWeight * 100).toFixed()) });

  const handleNewAccount = () => {
    setHasNewAccount(false);

    sendNewSplit(newAccount);

    setNewWeight(0.05);
    setNewAccount(({ acc: '', message: '', weight: Number((newWeight * 100).toFixed()) }));
  };

  const handleChange = (newWeight: number) => {
    setNewWeight(newWeight);
    setNewAccount((previousValue) => ({
      ...previousValue,
      weight: Number((newWeight * 100).toFixed()) }));
  };

  const formattedWeight = (weight: number) =>{
    return Number((weight * 100).toFixed());
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4} >
        <List>
          {formattedData.map((data) => (
            <ListItem key={data.account.id} label={''}>
              <div className='relative flex w-full flex-col items-start justify-center gap-4 sm:flex-row sm:justify-between'>
                <div className='flex w-60 justify-center sm:justify-start '>
                  <Account account={data.account} showProfileHoverCard={false} />
                </div>
                <HStack space={2} className='w-full sm:justify-end'>
                  <ZapSplitSlider
                    width='w-[96%] sm:w-40'
                    initialWeight={weights[data.account.id] || 0}
                    onWeightChange={(weight) => handleWeightChange(data.account.id, weight)}
                  />
                  <Button type='button' className='absolute right-0 top-2 sm:relative sm:right-0 sm:top-0' size='xs' icon={closeIcon} theme='transparent' onClick={() => removeAccount(data.account.id)} />
                </HStack>
              </div>
            </ListItem>
          ))}

          {hasNewAccount && (
            <AddNewAccount
              newAccount={newAccount}
              newWeight={newWeight}
              setNewAccount={setNewAccount}
              handleChange={handleChange}
              formattedWeight={formattedWeight}
              closeNewAccount={() => {
                setHasNewAccount(false);
                setNewWeight(0.05);
              }}
            />
          )}

        </List>
        {hasNewAccount && <Button theme='secondary' type='button' onClick={handleNewAccount}>
          <FormattedMessage id='manage.zap_split.add_new_account' defaultMessage='Add New Account' />
        </Button>}
        {!hasNewAccount && <Button theme='secondary' type='button' onClick={() => setHasNewAccount(true)}>
          <FormattedMessage id='manage.zap_split.add' defaultMessage='Add' />
        </Button>}
        <HStack space={2} justifyContent='end'>
          <Button to='/admin' theme='tertiary'>
            <FormattedMessage id='common.cancel' defaultMessage='Cancel' />
          </Button>
          <Button type='button' theme='primary' onClick={() => sendNewSplit()}>
            <FormattedMessage id='manage.zap_split.save' defaultMessage='Save' />
          </Button>
        </HStack>
      </Stack>
    </Column>
  );
};

export default ManageZapSplit;
export type { INewAccount };