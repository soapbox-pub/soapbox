import { nip19 } from 'nostr-tools';
import { Redirect } from 'react-router-dom';

import MissingIndicator from 'soapbox/components/missing-indicator.tsx';

interface INIP19Redirect {
  params: {
    bech32: string;
  };
}

const Bech32Redirect: React.FC<INIP19Redirect> = ({ params }) => {
  try {
    const result = nip19.decode(params.bech32);

    switch (result.type) {
      case 'npub':
      case 'nprofile':
        return <Redirect to={`/@${params.bech32}`} />;
      case 'note':
        return <Redirect to={`/posts/${result.data}`} />;
      case 'nevent':
        return <Redirect to={`/posts/${result.data.id}`} />;
      default:
        return <MissingIndicator />;
    }

  } catch (e) {
    return <MissingIndicator />;
  }
};

export default Bech32Redirect;