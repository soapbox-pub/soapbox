import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { z } from 'zod';

/** Public directory of Mastodon servers, the same one the official Mastodon apps use. */
const SERVER_DIRECTORY_URL = 'https://api.joinmastodon.org/servers';

const directoryServerSchema = z.object({
  domain: z.string(),
  description: z.string().catch(''),
  proxied_thumbnail: z.string().url().nullable().catch(null),
  total_users: z.number().catch(0),
  last_week_users: z.number().catch(0),
  approval_required: z.boolean().catch(false),
  category: z.string().catch(''),
});

type DirectoryServer = z.infer<typeof directoryServerSchema>;

/** Parse each entry separately so one malformed server doesn't sink the whole list. */
const directorySchema = z.array(z.unknown()).transform((items) => items.flatMap((item) => {
  const result = directoryServerSchema.safeParse(item);
  return result.success ? [result.data] : [];
}));

/** Fetch the joinmastodon.org server directory, sorted by weekly active users. */
function useServerDirectory() {
  return useQuery<DirectoryServer[]>({
    queryKey: ['serverDirectory'],
    queryFn: async ({ signal }) => {
      const response = await fetch(SERVER_DIRECTORY_URL, { signal });
      if (!response.ok) throw new Error(`Server directory returned ${response.status}`);
      const servers = directorySchema.parse(await response.json());
      return servers.sort((a, b) => b.last_week_users - a.last_week_users);
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Servers from the directory matching the query.
 * Domains starting with the query rank first, then other substring matches.
 * With an empty query, the most active servers are returned.
 */
function useServerSuggestions(query: string, limit = 6): DirectoryServer[] {
  const { data: servers = [] } = useServerDirectory();

  return useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return servers.slice(0, limit);

    const prefixed: DirectoryServer[] = [];
    const contained: DirectoryServer[] = [];

    for (const server of servers) {
      const domain = server.domain.toLowerCase();
      if (domain.startsWith(q)) {
        prefixed.push(server);
      } else if (domain.includes(q)) {
        contained.push(server);
      }
    }

    return [...prefixed, ...contained].slice(0, limit);
  }, [servers, query, limit]);
}

export { useServerDirectory, useServerSuggestions, type DirectoryServer };
