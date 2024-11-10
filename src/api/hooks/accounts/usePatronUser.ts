import { Entities } from 'soapbox/entity-store/entities.ts';
import { useEntity } from 'soapbox/entity-store/hooks/index.ts';
import { useApi } from 'soapbox/hooks/index.ts';
import { useSoapboxConfig } from 'soapbox/hooks/useSoapboxConfig.ts';
import { type PatronUser, patronUserSchema } from 'soapbox/schemas/index.ts';

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