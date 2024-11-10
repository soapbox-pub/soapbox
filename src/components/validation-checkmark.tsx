import checkIcon from '@tabler/icons/outline/check.svg';
import pointIcon from '@tabler/icons/outline/point.svg';
import clsx from 'clsx';

import { HStack, Icon, Text } from 'soapbox/components/ui/index.ts';

interface IValidationCheckmark {
  isValid: boolean;
  text: string;
}

const ValidationCheckmark = ({ isValid, text }: IValidationCheckmark) => {
  return (
    <HStack alignItems='center' space={2} data-testid='validation-checkmark'>
      <Icon
        src={isValid ? checkIcon : pointIcon}
        className={clsx({
          'w-4 h-4': true,
          'text-gray-400 dark:text-gray-600 dark:fill-gray-600 fill-gray-400': !isValid,
          'text-success-500': isValid,
        })}
      />

      <Text theme='muted' size='sm'>{text}</Text>
    </HStack>
  );
};

export default ValidationCheckmark;
