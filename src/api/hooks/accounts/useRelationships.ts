import { MastodonResponse } from 'soapbox/api/MastodonResponse.ts';
import { Entities } from 'soapbox/entity-store/entities.ts';
import { useBatchedEntities } from 'soapbox/entity-store/hooks/useBatchedEntities.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useLoggedIn } from 'soapbox/hooks/useLoggedIn.ts';
import { type Relationship, relationshipSchema } from 'soapbox/schemas/index.ts';

function useRelationships(listKey: string[], ids: string[]) {
  const api = useApi();
  const { isLoggedIn } = useLoggedIn();

  async function fetchRelationships(ids: string[]) {
    const results: Relationship[] = [];

    for (const id of chunkArray(ids, 20)) {
      const response = await api.get('/api/v1/accounts/relationships', { searchParams: { id } });
      const json = await response.json();

      results.push(...json);
    }

    return new MastodonResponse(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { entityMap: relationships, ...result } = useBatchedEntities<Relationship>(
    [Entities.RELATIONSHIPS, ...listKey],
    ids,
    fetchRelationships,
    { schema: relationshipSchema, enabled: isLoggedIn },
  );

  return { relationships, ...result };
}

function* chunkArray<T>(array: T[], chunkSize: number): Iterable<T[]> {
  if (chunkSize <= 0) throw new Error('Chunk size must be greater than zero.');

  for (let i = 0; i < array.length; i += chunkSize) {
    yield array.slice(i, i + chunkSize);
  }
}

export { useRelationships };