import xIcon from '@tabler/icons/outline/x.svg';
import { useState } from 'react';
import { FormattedMessage, defineMessages, useIntl } from 'react-intl';

import Account from 'soapbox/components/account.tsx';
import List, { ListItem } from 'soapbox/components/list.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import { Column } from 'soapbox/components/ui/column.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';

import { useManageZapSplit } from '../../api/hooks/admin/useManageZapSplit.ts';
import AddNewAccount from '../ui/components/new-account-zap-split.tsx';
import { ZapSplitSlider } from '../zap/components/zap-split-account-item.tsx';

const closeIcon = xIcon;

const messages = defineMessages({
  heading: { id: 'column.admin.zap_split', defaultMessage: 'Manage Zap Split' },
});

interface INewAccount{
  acc: string;
  message: string;
  weight: number;
}

/**
 * Main component that handles the logic and UI for managing accounts in Zap Split.
 * Allows the user to view and edit associated accounts, adjust weights, and add new accounts.
 *
 * @returns A component that renders the Zap Split account management interface.
 */
const ManageZapSplit: React.FC = () => {
  const intl = useIntl();
  const { formattedData, weights, message, handleMessageChange, handleWeightChange, sendNewSplit, removeAccount } = useManageZapSplit();
  const [hasNewAccount, setHasNewAccount] = useState(false);
  const [newWeight, setNewWeight] = useState(0.05);
  const [newAccount, setNewAccount] = useState<INewAccount>({ acc: '', message: '', weight: Number((newWeight * 100).toFixed()) });

  /**
  * Function that handles submitting a new account to Zap Split. It resets the form and triggers
  * the submission of the account with the current data.
  */
  const handleNewAccount = () => {
    setHasNewAccount(false);

    sendNewSplit(newAccount);

    setNewWeight(0.05);
    setNewAccount(({ acc: '', message: '', weight: Number((newWeight * 100).toFixed()) }));
  };

  /**
  * Updates the weight of the new account and adjusts the `newAccount` state with the new weight value.
  *
  * @param newWeight - The new weight assigned to the account.
  */
  const handleChange = (newWeight: number) => {
    setNewWeight(newWeight);
    setNewAccount((previousValue) => ({
      ...previousValue,
      weight: Number((newWeight * 100).toFixed()) }));
  };

  /**
  * Formats the weight value into an integer representing the percentage.
  *
  * @param weight - The weight as a decimal number (e.g., 0.05).
  * @returns The formatted weight as an integer (e.g., 5 for 5%).
  */
  const formattedWeight = (weight: number) =>{
    return Number((weight * 100).toFixed());
  };

  return (
    <Column label={intl.formatMessage(messages.heading)}>
      <Stack space={4} >
        <List>
          {formattedData.map((data) => (
            <ListItem key={data.account.id} label={''}>
              <div className='relative flex w-full flex-col items-start justify-center gap-4 pt-2 md:flex-row md:items-center md:justify-between md:pt-0'>
                <div className='flex min-w-60 items-center  justify-center md:justify-start'>
                  <Account account={data.account} showProfileHoverCard={false} />
                </div>

                <div className='flex w-[96%] flex-col justify-center md:w-full'>
                  <FormattedMessage id='manage.zap_split.new_account_message' defaultMessage='Message:' />
                  <Input
                    className='md:-mt-1'
                    value={message[data.account.id] || ''}
                    onChange={(e) =>
                      handleMessageChange(data.account.id, e.target.value)
                    }
                  />
                </div>
                <HStack space={2} className='w-full md:justify-end'>
                  <ZapSplitSlider
                    width='w-[96%] md:w-40'
                    initialWeight={weights[data.account.id] || 0}
                    onWeightChange={(weight) => handleWeightChange(data.account.id, weight)}
                  />
                  <Button type='button' className='absolute right-0 top-0 md:relative' size='xs' icon={closeIcon} theme='transparent' onClick={() => removeAccount(data.account.id)} />
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