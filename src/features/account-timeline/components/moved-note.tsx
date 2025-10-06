import briefcaseIcon from '@tabler/icons/outline/briefcase.svg';
import { FormattedMessage } from 'react-intl';

import Account from '@/components/account.tsx';
import Icon from '@/components/icon.tsx';
import HStack from '@/components/ui/hstack.tsx';
import Text from '@/components/ui/text.tsx';
import { emojifyText } from '@/utils/emojify.tsx';

import type { Account as AccountEntity } from '@/schemas/index.ts';

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
              name: emojifyText(from.display_name, from.emojis),
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
