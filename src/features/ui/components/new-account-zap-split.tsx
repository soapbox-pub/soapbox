import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import Account from 'soapbox/components/account';
import { ListItem } from 'soapbox/components/list';
import { Button, HStack, Input, Slider } from 'soapbox/components/ui';
import SearchZapSplit from 'soapbox/features/compose/components/search-zap-split';
import { type Account as AccountEntity } from 'soapbox/schemas';

const closeIcon = require('@tabler/icons/outline/x.svg');

interface INewAccount {
  acc: string;
  message: string;
  weight: number;
}

interface AddNewAccountProps {
  newAccount: INewAccount;
  newWeight: number;
  setNewAccount: React.Dispatch<React.SetStateAction<INewAccount>>;
  handleChange: (newWeight: number) => void;
  formattedWeight: (weight: number) => number;
  closeNewAccount: () => void;
}

const AddNewAccount: React.FC<AddNewAccountProps> = ({
  newAccount,
  newWeight,
  setNewAccount,
  handleChange,
  formattedWeight,
  closeNewAccount,
}) => {

  const [accountSelected, setAccountSelected] = useState<AccountEntity | null>(null);

  useEffect(() => {
    if (accountSelected) {
      setNewAccount((previousValue) => ({
        ...previousValue,
        acc: accountSelected?.id || '',
      }));
    }
  }, [accountSelected, setNewAccount]);

  return (
    <ListItem label={<div className='' />}>
      <div className='relative flex w-full flex-col items-center justify-between gap-6 pt-2 md:flex-row md:pt-0'>
        <div className='item-center flex flex-col justify-start gap-4 md:w-full md:flex-row'>

          {accountSelected ?
            <div className='flex items-center md:w-40'>
              <Account account={accountSelected} />
            </div>
            :
            <div className='flex w-full flex-col items-start justify-center'>
              <FormattedMessage id='manage.zap_split.new_account' defaultMessage='Account:' />
              <SearchZapSplit autosuggest onChange={setAccountSelected} />
            </div>
          }

          <div className='flex w-full flex-col justify-center md:items-start'>
            <FormattedMessage id='manage.zap_split.new_account_message' defaultMessage='Message:' />
            <Input
              value={newAccount.message}
              onChange={(e) =>
                setNewAccount((previousValue) => ({
                  ...previousValue,
                  message: e.target.value,
                }))
              }
            />
          </div>
        </div>

        <HStack space={2} className='w-full md:flex-1 md:justify-end'>
          <div className='flex w-[96%] flex-col md:w-40'>
            {formattedWeight(newWeight)}%
            <Slider value={newWeight} onChange={(e) => handleChange(e)} />
          </div>

          <Button
            type='button'
            size='xs'
            icon={closeIcon}
            className='absolute right-0 top-0 md:relative'
            theme='transparent'
            onClick={closeNewAccount}
          />
        </HStack>
      </div>
    </ListItem>
  );
};

export default AddNewAccount;