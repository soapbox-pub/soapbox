import flameIcon from '@tabler/icons/filled/flame.svg';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Text from 'soapbox/components/ui/text.tsx';
// import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
// import { shortNumberFormat } from 'soapbox/utils/numbers.tsx';

// const messages = defineMessages({
//   streak: { id: 'account.streak', defaultMessage: 'Day Streak' },
// });

interface IStreakModal {
  onClose: () => void;
}

const StreakModal: React.FC<IStreakModal> = ({ onClose }) => {
  // const { account } = useOwnAccount();
  // const intl = useIntl();
  // const streakCount = account ? shortNumberFormat(account.ditto.streak.days) : 0;

  return (
    <Modal
      title={
        <HStack alignItems='center' justifyContent='center' space={1} className='-mr-8'>
          <Text weight='bold' size='lg' className='text-black'>
            <FormattedMessage id='streak_modal.title' defaultMessage="You've unlocked a" />
          </Text>
          <Text theme='primary'>
            <Icon src={flameIcon} className='size-6' />
          </Text>
          <Text weight='bold' size='lg' className='text-black'>
            <FormattedMessage id='streak_modal.sub' defaultMessage='streak!' />
          </Text>
        </HStack>
      }
      onClose={onClose}
    >
      <HStack justifyContent='center'>
        <Text className=''>
          <FormattedMessage id='streak_modal.message' defaultMessage='Post every day to keep it going.' />
        </Text>
      </HStack>
    </Modal>
  );
};

export default StreakModal;