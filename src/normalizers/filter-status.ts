/**
 * Filter normalizer:
 * Converts API filters into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/FilterStatus/}
 */
import { fromDefaults } from '@/utils/normalizers.ts';

// https://docs.joinmastodon.org/entities/FilterStatus/
export interface FilterStatus {
  id: string;
  status_id: string;
}

export const normalizeFilterStatus = (filterStatus: Record<string, any>): FilterStatus =>
  fromDefaults<FilterStatus>({
    id: '',
    status_id: '',
  }, filterStatus);
