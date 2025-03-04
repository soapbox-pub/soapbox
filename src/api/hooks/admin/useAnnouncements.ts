import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks/useApi.ts';
import { queryClient } from 'soapbox/queries/client.ts';
import { adminAnnouncementSchema, type AdminAnnouncement } from 'soapbox/schemas/index.ts';

import { useAnnouncements as useUserAnnouncements } from '../announcements/index.ts';

interface CreateAnnouncementParams {
  content: string;
  starts_at?: string | null;
  ends_at?: string | null;
  all_day?: boolean;
}

interface UpdateAnnouncementParams extends CreateAnnouncementParams {
  id: string;
}

const useAnnouncements = () => {
  const api = useApi();
  const userAnnouncements = useUserAnnouncements();

  const getAnnouncements = async () => {
    const response = await api.get('/api/v1/pleroma/admin/announcements');
    const data: AdminAnnouncement[] = await response.json();

    const normalizedData = data.map((announcement) => adminAnnouncementSchema.parse(announcement));
    return normalizedData;
  };

  const result = useQuery<ReadonlyArray<AdminAnnouncement>>({
    queryKey: ['admin', 'announcements'],
    queryFn: getAnnouncements,
    placeholderData: [],
  });

  const {
    mutate: createAnnouncement,
    isPending: isCreating,
  } = useMutation({
    mutationFn: (params: CreateAnnouncementParams) => api.post('/api/v1/pleroma/admin/announcements', params),
    retry: false,
    onSuccess: async (response: Response) => {
      const data = await response.json();
      return queryClient.setQueryData(['admin', 'announcements'], (prevResult: ReadonlyArray<AdminAnnouncement>) =>
        [...prevResult, adminAnnouncementSchema.parse(data)],
      );
    },
    onSettled: () => userAnnouncements.refetch(),
  });

  const {
    mutate: updateAnnouncement,
    isPending: isUpdating,
  } = useMutation({
    mutationFn: ({ id, ...params }: UpdateAnnouncementParams) => api.patch(`/api/v1/pleroma/admin/announcements/${id}`, params),
    retry: false,
    onSuccess: async (response: Response) => {
      const data = await response.json();
      return queryClient.setQueryData(['admin', 'announcements'], (prevResult: ReadonlyArray<AdminAnnouncement>) =>
        prevResult.map((announcement) => announcement.id === data.id ? adminAnnouncementSchema.parse(data) : announcement),
      );
    },
    onSettled: () => userAnnouncements.refetch(),
  });

  const {
    mutate: deleteAnnouncement,
    isPending: isDeleting,
  } = useMutation({
    mutationFn: (id: string) => api.delete(`/api/v1/pleroma/admin/announcements/${id}`),
    retry: false,
    onSuccess: (_, id) =>
      queryClient.setQueryData(['admin', 'announcements'], (prevResult: ReadonlyArray<AdminAnnouncement>) =>
        prevResult.filter(({ id: announcementId }) => announcementId !== id),
      ),
    onSettled: () => userAnnouncements.refetch(),
  });

  return {
    ...result,
    createAnnouncement,
    isCreating,
    updateAnnouncement,
    isUpdating,
    deleteAnnouncement,
    isDeleting,
  };
};

export { useAnnouncements };
