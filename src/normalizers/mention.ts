/**
 * Mention normalizer:
 * Converts API mentions into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/mention/}
 */
import { fromDefaults } from '@/utils/normalizers.ts';

// https://docs.joinmastodon.org/entities/mention/
export interface Mention {
  id: string;
  acct: string;
  username: string;
  url: string;
}

export const normalizeMention = (mention: Record<string, any>): Mention => {
  const result = fromDefaults<Mention>({
    id: '',
    acct: '',
    username: '',
    url: '',
  }, mention);

  // Set username from acct, if applicable
  result.username = result.username || result.acct.split('@')[0];

  return result;
};
