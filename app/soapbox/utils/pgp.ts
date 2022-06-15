import { generateKey } from 'openpgp';

import KVStore from 'soapbox/storage/kv_store';

/**
 * Detect whether a message contains valid PGP headers.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc4880#section-7}
 */
const isPgpMessage = (message: string): boolean => {
  return /^-----BEGIN PGP [A-Z ]+-----/.test(message);
};

/** Check whether a message contains a PGP public key. */
const isPgpPublicKeyMessage = (message: string): boolean => {
  return /^-----BEGIN PGP PUBLIC KEY BLOCK-----/.test(message);
};

/** Whether the message is a PGP encrypted message. */
const isPgpEncryptedMessage = (message: string): boolean => {
  return /^-----BEGIN PGP MESSAGE-----/.test(message);
};

/** Generate a key and store it in the browser, if one doesn't already exist. */
const initPgpKey = async(fqn: string) => {
  const item = await KVStore.getItem(`pgp:${fqn}`);

  if (item) {
    return item;
  } else {
    const key = generateKey({ userIDs: [{ name: fqn }] });
    return await KVStore.setItem(`pgp:${fqn}`, key);
  }
};

/** Store the public key of another user. */
const savePgpKey = async(fqn: string, publicKey: string) => {
  return await KVStore.setItem(`pgp:${fqn}`, { publicKey });
};

/** Get PGP keys for the given account. */
const getPgpKey = async(fqn: string) => {
  return await KVStore.getItem(`pgp:${fqn}`);
};

export {
  isPgpMessage,
  isPgpPublicKeyMessage,
  isPgpEncryptedMessage,
  initPgpKey,
  savePgpKey,
  getPgpKey,
};
