import { BECH32_REGEX } from 'nostr-tools/nip19';

/** Check whether the given input is a valid Nostr hexadecimal pubkey. */
const isPubkey = (value: string) => /^[0-9a-f]{64}$/i.test(value);

/** If the value is a Nostr pubkey or bech32, shorten it. */
export function shortenNostr(value: string): string {
  if (isPubkey(value) || BECH32_REGEX.test(value)) {
    return value.slice(0, 8);
  }
  return value;
}