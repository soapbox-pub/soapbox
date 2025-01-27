import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks/useApi.ts';
import { queryClient } from 'soapbox/queries/client.ts';
import { announcementReactionSchema, announcementSchema, type Announcement, type AnnouncementReaction } from 'soapbox/schemas/index.ts';

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
    const response = await api.get('/api/v1/announcements');
    const data: Announcement[] = await response.json();

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
    mutationFn: async ({ announcementId, name }: { announcementId: string; name: string }): Promise<Announcement> => {
      const response = await api.put(`/api/v1/announcements/${announcementId}/reactions/${name}`);
      return response.json();
    },
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
    mutationFn: async ({ announcementId, name }: { announcementId: string; name: string }): Promise<Announcement> => {
      const response = await api.delete(`/api/v1/announcements/${announcementId}/reactions/${name}`);
      return response.json();
    },
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
    data: data ? [...data].sort(compareAnnouncements) : undefined,
    ...result,
    addReaction,
    removeReaction,
  };
};

function compareAnnouncements(a: Announcement, b: Announcement): number {
  return new Date(a.starts_at || a.published_at).getDate() - new Date(b.starts_at || b.published_at).getDate();
}

export { useAnnouncements };
