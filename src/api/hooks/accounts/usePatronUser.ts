import { Entities } from '@/entity-store/entities.ts';
import { useEntity } from '@/entity-store/hooks/index.ts';
import { useApi } from '@/hooks/useApi.ts';
import { useSoapboxConfig } from '@/hooks/useSoapboxConfig.ts';
import { type PatronUser, patronUserSchema } from '@/schemas/index.ts';

function usePatronUser(url?: string) {
  const api = useApi();
  const soapboxConfig = useSoapboxConfig();

  const patronEnabled = soapboxConfig.getIn(['extensions', 'patron', 'enabled']) === true;

  const { entity: patronUser, ...result } = useEntity<PatronUser>(
    [Entities.PATRON_USERS, url || ''],
    () => api.get(`/api/patron/v1/accounts/${encodeURIComponent(url!)}`),
    { schema: patronUserSchema, enabled: patronEnabled && !!url },
  );

  return { patronUser, ...result };
}

export { usePatronUser };