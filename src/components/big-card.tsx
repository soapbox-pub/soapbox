import xIcon from '@tabler/icons/outline/x.svg';

import { Card, CardBody } from 'soapbox/components/ui/card.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';

const closeIcon = xIcon;

interface IBigCard {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  onClose?(): void;
}

const BigCard: React.FC<IBigCard> = ({ title, subtitle, children, onClose }) => {
  return (
    <Card size='xl' rounded>
      <CardBody className='relative'>
        <div className='-mx-4 mb-4 border-b border-solid border-gray-200 pb-4 dark:border-gray-800 sm:-mx-10 sm:pb-10'>
          <Stack space={2}>
            {onClose && (<IconButton src={closeIcon} className='absolute right-[2%]  text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200 rtl:rotate-180' onClick={onClose} />)}
            <Text size='2xl' align='center' weight='bold'>{title}</Text>
            {subtitle && <Text theme='muted' align='center'>{subtitle}</Text>}
          </Stack>
        </div>

        <Stack space={5}>
          <div className='mx-auto sm:w-2/3 sm:pt-10'>
            {children}
          </div>
        </Stack>
      </CardBody>
    </Card>
  );
};

export { BigCard };