import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';
import { queryClient } from 'soapbox/queries/client';
import { announcementReactionSchema, announcementSchema, type Announcement, type AnnouncementReaction } from 'soapbox/schemas';

const updateReaction = (reaction: AnnouncementReaction, count: number, me?: boolean, overwrite?: boolean) => announcementReactionSchema.parse({
  ...reaction,
  me: typeof me === 'boolean' ? me : reaction.me,
  count: overwrite ? count : (reaction.count + count),
});

export const updateReactions = (reactions: AnnouncementReaction[], name: string, count: number, me?: boolean, overwrite?: boolean) => {
  const idx = reactions.findIndex(reaction => reaction.name === name);

  if (idx > -1) {
    reactions = reactions.map(reaction => reaction.name === name ? updateReaction(reaction, count, me, overwrite) : reaction);
  }

  return [...reactions, updateReaction(announcementReactionSchema.parse({ name }), count, me, overwrite)];
};

const useAnnouncements = () => {
  const api = useApi();

  const getAnnouncements = async () => {
    const { data } = await api.get<Announcement[]>('/api/v1/announcements');

    const normalizedData = data?.map((announcement) => announcementSchema.parse(announcement));
    return normalizedData;
  };

  const { data, ...result } = useQuery<ReadonlyArray<Announcement>>({
    queryKey: ['announcements'],
    queryFn: getAnnouncements,
    placeholderData: [],
  });

  const {
    mutate: addReaction,
  } = useMutation({
    mutationFn: ({ announcementId, name }: { announcementId: string; name: string }) =>
      api.put<Announcement>(`/api/v1/announcements/${announcementId}/reactions/${name}`),
    retry: false,
    onMutate: ({ announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
        prevResult.map(value => value.id !== id ? value : announcementSchema.parse({
          ...value,
          reactions: updateReactions(value.reactions, name, 1, true),
        })),
      );
    },
    onError: (_, { announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
        prevResult.map(value => value.id !== id ? value : announcementSchema.parse({
          ...value,
          reactions: updateReactions(value.reactions, name, -1, false),
        })),
      );
    },
  });

  const {
    mutate: removeReaction,
  } = useMutation({
    mutationFn: ({ announcementId, name }: { announcementId: string; name: string }) =>
      api.delete<Announcement>(`/api/v1/announcements/${announcementId}/reactions/${name}`),
    retry: false,
    onMutate: ({ announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
        prevResult.map(value => value.id !== id ? value : announcementSchema.parse({
          ...value,
          reactions: updateReactions(value.reactions, name, -1, false),
        })),
      );
    },
    onError: (_, { announcementId: id, name }) => {
      queryClient.setQueryData(['announcements'], (prevResult: Announcement[]) =>
        prevResult.map(value => value.id !== id ? value : announcementSchema.parse({
          ...value,
          reactions: updateReactions(value.reactions, name, 1, true),
        })),
      );
    },
  });

  return {
    data: data?.toSorted((a, b) => new Date(a.starts_at || a.published_at).getDate() - new Date(b.starts_at || b.published_at).getDate()),
    ...result,
    addReaction,
    removeReaction,
  };
};

export { useAnnouncements };
