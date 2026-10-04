/**
 * History normalizer:
 * Converts API daily usage history of a hashtag into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/history/}
 */
import { fromDefaults } from '@/utils/normalizers.ts';

// https://docs.joinmastodon.org/entities/history/
export interface History {
  accounts: string;
  day: string;
  uses: string;
}

export const normalizeHistory = (history: Record<string, any>): History => {
  return fromDefaults<History>({
    accounts: '',
    day: '',
    uses: '',
  }, history);
};
