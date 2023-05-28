import { useEffect } from 'react';

import { importFetchedStatuses } from 'soapbox/actions/importer';
import { Entities } from 'soapbox/entity-store/entities';
import { useEntities } from 'soapbox/entity-store/hooks';
import { useAppDispatch } from 'soapbox/hooks';
import { useApi } from 'soapbox/hooks/useApi';
import { statusSchema } from 'soapbox/schemas';

import type { Sort } from 'soapbox/features/status/components/sort-button';

/** TruthSocial descendants hook. */
function useStatusDescendants(statusId: string, sort: Sort = 'trending') {
  const api = useApi();
  const dispatch = useAppDispatch();

  const { entities, ...result } = useEntities(
    [Entities.STATUSES, 'descendants', statusId, sort],
    async () => {
      const response = await api.get(`/api/v2/statuses/${statusId}/context/descendants?sort=${sort}`);
      // FIXME: switch to EntityStore
      dispatch(importFetchedStatuses(response.data));
      return response;
    },
    { schema: statusSchema },
  );

  useEffect(() => {
    result.invalidate();
  }, [sort]);

  return {
    ...result,
    statuses: entities,
  };
}

export { useStatusDescendants };