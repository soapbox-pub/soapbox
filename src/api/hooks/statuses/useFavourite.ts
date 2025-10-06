import { favourite as favouriteAction, unfavourite as unfavouriteAction, toggleFavourite as toggleFavouriteAction } from '@/actions/interactions.ts';
import { Entities } from '@/entity-store/entities.ts';
import { selectEntity } from '@/entity-store/selectors.ts';
import { useAppDispatch } from '@/hooks/useAppDispatch.ts';
import { useGetState } from '@/hooks/useGetState.ts';
import { normalizeStatus } from '@/normalizers/index.ts';
import { Status as StatusEntity } from '@/schemas/index.ts';

import type { Status as LegacyStatus } from '@/types/entities.ts';

export function useFavourite() {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  const favourite = (statusId: string) => {
    let status: undefined|LegacyStatus|StatusEntity = getState().statuses.get(statusId);

    if (status) {
      dispatch(favouriteAction(status));
      return;
    }

    status = selectEntity<StatusEntity>(getState(), Entities.STATUSES, statusId);
    if (status) {
      dispatch(favouriteAction(normalizeStatus(status) as LegacyStatus));
      return;
    }
  };

  const unfavourite = (statusId: string) => {
    let status: undefined|LegacyStatus|StatusEntity = getState().statuses.get(statusId);

    if (status) {
      dispatch(unfavouriteAction(status));
      return;
    }

    status = selectEntity<StatusEntity>(getState(), Entities.STATUSES, statusId);
    if (status) {
      dispatch(unfavouriteAction(normalizeStatus(status) as LegacyStatus));
      return;
    }
  };

  const toggleFavourite = (statusId: string) => {
    let status: undefined|LegacyStatus|StatusEntity = getState().statuses.get(statusId);

    if (status) {
      dispatch(toggleFavouriteAction(status));
      return;
    }

    status = selectEntity<StatusEntity>(getState(), Entities.STATUSES, statusId);
    if (status) {
      dispatch(toggleFavouriteAction(normalizeStatus(status) as LegacyStatus));
      return;
    }
  };

  return { favourite, unfavourite, toggleFavourite };
}
