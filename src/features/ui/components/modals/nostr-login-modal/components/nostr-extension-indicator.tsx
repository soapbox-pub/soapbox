import { FormattedMessage } from 'react-intl';


import { closeModal } from 'soapbox/actions/modals.ts';
import { nostrExtensionLogIn } from 'soapbox/actions/nostr.ts';
import Stack from 'soapbox/components/ui/stack/stack.tsx';
import Text from 'soapbox/components/ui/text/text.tsx';
import { useNostr } from 'soapbox/contexts/nostr-context.tsx';
import { useAppDispatch } from 'soapbox/hooks/index.ts';

const NostrExtensionIndicator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { relay } = useNostr();

  const onClick = () => {
    if (relay) {
      dispatch(nostrExtensionLogIn(relay));
      dispatch(closeModal());
    }
  };

  function renderBody(): React.ReactNode {
    if (window.nostr && window.nostr.nip44) {
      return (
        <FormattedMessage
          id='nostr_extension.found'
          defaultMessage='<link>Sign in</link> with browser extension.'
          values={{
            link: (node) => <button type='button' className='underline' onClick={onClick}>{node}</button>,
          }}
        />
      );
    } else if (window.nostr) {
      return (
        <FormattedMessage
          id='nostr_extension.not_supported'
          defaultMessage='Browser extension not supported. Please upgrade to the latest version.'
        />
      );
    } else {
      return (
        <FormattedMessage
          id='nostr_extension.not_found'
          defaultMessage='Browser extension not found.'
        />
      );
    }
  }

  return (
    <Stack space={2} className='flex items-center rounded-lg bg-gray-100 p-2 dark:bg-gray-800'>
      <Text size='xs'>
        {renderBody()}
      </Text>
    </Stack>
  );
};

export default NostrExtensionIndicator;