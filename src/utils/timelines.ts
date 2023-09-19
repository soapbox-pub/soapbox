import { Map as ImmutableMap, type Collection } from 'immutable';

import type { Status } from 'soapbox/schemas';

export const shouldFilter = (
  status: Pick<Status, 'in_reply_to_id' | 'visibility'> & { reblog: unknown },
  columnSettings: Collection<any, any>,
) => {
  const shows = ImmutableMap({
    reblog: status.reblog !== null,
    reply: status.in_reply_to_id !== null,
    direct: status.visibility === 'direct',
  });

  return shows.some((value, key) => {
    return columnSettings.getIn(['shows', key]) === false && value;
  });
};
