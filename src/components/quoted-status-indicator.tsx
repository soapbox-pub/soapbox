import quoteIcon from '@tabler/icons/outline/quote.svg';
import { useCallback } from 'react';

import HStack from 'soapbox/components/ui/hstack.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppSelector } from 'soapbox/hooks/index.ts';
import { makeGetStatus } from 'soapbox/selectors/index.ts';

interface IQuotedStatusIndicator {
  /** The quoted status id. */
  statusId: string;
}

const QuotedStatusIndicator: React.FC<IQuotedStatusIndicator> = ({ statusId }) => {
  const getStatus = useCallback(makeGetStatus(), []);

  const status = useAppSelector(state => getStatus(state, { id: statusId }));

  if (!status) return null;

  return (
    <HStack alignItems='center' space={1}>
      <Icon className='size-5' src={quoteIcon} aria-hidden />
      <Text truncate>{status.url}</Text>
    </HStack>
  );
};

export default QuotedStatusIndicator;
