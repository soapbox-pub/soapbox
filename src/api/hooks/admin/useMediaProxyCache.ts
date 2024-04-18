import { useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';

interface BannedUrlsResult {
  urls: string;
  count: number;
}

const flattenPages = (pages?: BannedUrlsResult[]): string[] => (pages || []).map(({ urls }) => urls).flat();

const useMediaProxyCache = () => {
  const api = useApi();

  const getBannedUrls = async (page: number): Promise<BannedUrlsResult> => {
    const { data } = await api.get<BannedUrlsResult>('/api/v1/pleroma/admin/media_proxy_caches', { params: { page } });

    return data;
  };

  const queryInfo = useInfiniteQuery({
    queryKey: ['admin', 'media_proxy_cache', 'banned_urls'],
    queryFn: ({ pageParam }) => getBannedUrls(pageParam),
    initialPageParam: 1,
    getNextPageParam: (page, allPages) => flattenPages(allPages)!.length >= page.count ? undefined : allPages.length + 1,
  });

  const data = flattenPages(queryInfo.data?.pages);

  const {
    mutate: purgeUrls,
    isPending: isPurging,
  } = useMutation({
    mutationFn: (params: { urls: string[]; ban?: boolean }) => api.post('/api/v1/pleroma/admin/media_proxy_caches/purge', params),
    retry: false,
    onSuccess: () => queryInfo.refetch(),
  });

  const {
    mutate: unbanUrls,
    isPending: isUnbanning,
  } = useMutation({
    mutationFn: (params: { urls: string[]; ban?: boolean }) => api.post('/api/v1/pleroma/admin/media_proxy_caches/delete', params),
    retry: false,
    onSuccess: () => queryInfo.refetch(),
  });

  return {
    ...queryInfo,
    data,
    purgeUrls,
    isPurging,
    unbanUrls,
    isUnbanning,
  };
};

export { useMediaProxyCache };
