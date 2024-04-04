import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useApi, useFeatures } from 'soapbox/hooks';
import { trendsLinkSchema } from 'soapbox/schemas/trends-link';

const useTrendingLinks = () => {
  const api = useApi();
  const features = useFeatures();

  const { entities, ...rest } = useEntities(
    [Entities.TRENDS_LINKS],
    () => api.get('/api/v1/trends/links'),
    { schema: trendsLinkSchema, enabled: features.trendingLinks },
  );

  return { trendingLinks: entities, ...rest };
};

export { useTrendingLinks };
