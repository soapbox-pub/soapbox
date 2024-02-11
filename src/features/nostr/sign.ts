import { type  NostrSigner } from 'nspec';

import { SoapboxSigner } from './SoapboxSigner';

let signer: NostrSigner | undefined;

try {
  signer = new SoapboxSigner();
} catch (_) {
  // No signer available
}

export { signer };