import lockOpenIcon from '@tabler/icons/outline/lock-open.svg';
import { defineMessages, useIntl } from 'react-intl';

import { unblockDomain } from 'soapbox/actions/domain-blocks.ts';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

const messages = defineMessages({
  blockDomainConfirm: { id: 'confirmations.domain_block.confirm', defaultMessage: 'Hide entire domain' },
  unblockDomain: { id: 'account.unblock_domain', defaultMessage: 'Unhide {domain}' },
});

interface IDomain {
  domain: string;
}

const Domain: React.FC<IDomain> = ({ domain }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();

  // const onBlockDomain = () => {
  //   dispatch(openModal('CONFIRM', {
  //     icon: banIcon,
  //     heading: <FormattedMessage id='confirmations.domain_block.heading' defaultMessage='Block {domain}' values={{ domain }} />,
  //     message: <FormattedMessage id='confirmations.domain_block.message' defaultMessage='Are you really, really sure you want to block the entire {domain}? In most cases a few targeted blocks or mutes are sufficient and preferable.' values={{ domain: <strong>{domain}</strong> }} />,
  //     confirm: intl.formatMessage(messages.blockDomainConfirm),
  //     onConfirm: () => dispatch(blockDomain(domain)),
  //   }));
  // }

  const handleDomainUnblock = () => {
    dispatch(unblockDomain(domain));
  };

  return (
    <HStack alignItems='center' justifyContent='between' space={1} className='p-2'>
      <Text tag='span'>
        {domain}
      </Text>
      <IconButton iconClassName='h-5 w-5' src={lockOpenIcon} title={intl.formatMessage(messages.unblockDomain, { domain })} onClick={handleDomainUnblock} />
    </HStack>
  );
};

export default Domain;
