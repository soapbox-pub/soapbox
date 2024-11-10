import { entitiesTransaction } from 'soapbox/entity-store/actions.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

import type { EntityTypes } from 'soapbox/entity-store/entities.ts';
import type { EntitiesTransaction, Entity } from 'soapbox/entity-store/types.ts';

type Updater<TEntity extends Entity> = Record<string, (entity: TEntity) => TEntity>

type Changes = Partial<{
  [K in keyof EntityTypes]: Updater<EntityTypes[K]>
}>

function useTransaction() {
  const dispatch = useAppDispatch();

  function transaction(changes: Changes): void {
    dispatch(entitiesTransaction(changes as EntitiesTransaction));
  }

  return { transaction };
}

export { useTransaction };