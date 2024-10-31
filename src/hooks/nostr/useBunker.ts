import { useEffect } from 'react';

import { useNostr } from 'soapbox/contexts/nostr-context';
import { NBunker } from 'soapbox/features/nostr/NBunker';
import { useSigner } from 'soapbox/hooks/nostr/useSigner';

function useBunker() {
  const { relay } = useNostr();
  const { signer: userSigner, bunkerSigner, authorizedPubkey } = useSigner();

  useEffect(() => {
    if (!relay || !userSigner || !bunkerSigner || !authorizedPubkey) return;

    console.log('bunker opening');

    const bunker = new NBunker({
      relay,
      userSigner,
      bunkerSigner,
      onError(error, event) {
        console.warn('Bunker error:', error, event);
      },
    });

    bunker.authorize(authorizedPubkey);

    return () => {
      console.log('bunker closing');
      bunker.close();
    };
  }, [relay, userSigner, bunkerSigner, authorizedPubkey]);
}

export { useBunker };
