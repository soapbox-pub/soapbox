/** Check whether the given input is a valid Nostr hexadecimal pubkey. */
const isPubkey = (value: string) => /^[0-9a-f]{64}$/i.test(value);

export {
  isPubkey,
};