/**
 * List normalizer:
 * Converts API lists into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/list/}
 */
import { fromDefaults } from '@/utils/normalizers.ts';

// https://docs.joinmastodon.org/entities/list/
export interface List {
  id: string;
  title: string;
  replies_policy: 'followed' | 'list' | 'none' | null;
}

export const normalizeList = (list: Record<string, any>): List => {
  return fromDefaults<List>({
    id: '',
    title: '',
    replies_policy: null,
  }, list);
};
