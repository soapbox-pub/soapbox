import briefcaseIcon from '@tabler/icons/outline/briefcase.svg';
import { FormattedMessage } from 'react-intl';

import Account from 'soapbox/components/account.tsx';
import Icon from 'soapbox/components/icon.tsx';
import { HStack, Text } from 'soapbox/components/ui/index.ts';

import type { Account as AccountEntity } from 'soapbox/schemas/index.ts';

interface IMovedNote {
  from: AccountEntity;
  to: AccountEntity;
}

const MovedNote: React.FC<IMovedNote> = ({ from, to }) => (
  <div className='p-4'>
    <HStack className='mb-2' alignItems='center' space={1.5}>
      <Icon
        src={briefcaseIcon}
        className='flex-none text-primary-600 dark:text-primary-400'
      />

      <div className='truncate'>
        <Text theme='muted' size='sm' truncate>
          <FormattedMessage
            id='notification.move'
            defaultMessage='{name} moved to {targetName}'
            values={{
              name: <span dangerouslySetInnerHTML={{ __html: from.display_name_html }} />,
              targetName: to.acct,
            }}
          />
        </Text>
      </div>
    </HStack>

    <Account account={to} withRelationship={false} />
  </div>
);

export default MovedNote;
