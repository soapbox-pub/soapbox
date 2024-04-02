import { useInfiniteQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';
import { moderationLogEntrySchema, type ModerationLogEntry } from 'soapbox/schemas';

interface ModerationLogResult {
  items: ModerationLogEntry[];
  total: number;
}

const flattenPages = (pages?: ModerationLogResult[]): ModerationLogEntry[] => (pages || []).map(({ items }) => items).flat();

const useModerationLog = () => {
  const api = useApi();

  const getModerationLog = async (page: number): Promise<ModerationLogResult> => {
    const { data } = await api.get<ModerationLogResult>('/api/v1/pleroma/admin/moderation_log', { params: { page } });

    const normalizedData = data.items.map((domain) => moderationLogEntrySchema.parse(domain));

    return {
      items: normalizedData,
      total: data.total,
    };
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ['moderation_log'],
    queryFn: ({ pageParam }) => getModerationLog(pageParam),
    initialPageParam: 1,
    getNextPageParam: (page, allPages) => flattenPages(allPages)!.length >= page.total ? undefined : allPages.length + 1,
  });

  const data = flattenPages(queryInfo.data?.pages);

  return {
    ...queryInfo,
    data,
  };
};

export { useModerationLog };
