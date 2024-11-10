import { importEntities } from 'soapbox/entity-store/actions.ts';
import { Entities } from 'soapbox/entity-store/entities.ts';
import { type Entity } from 'soapbox/entity-store/types.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useGetState } from 'soapbox/hooks/useGetState.ts';

type ChangeEntityFn<TEntity extends Entity> = (entity: TEntity) => TEntity

function useChangeEntity<TEntity extends Entity = Entity>(entityType: Entities) {
  const getState = useGetState();
  const dispatch = useAppDispatch();

  function changeEntity(entityId: string, change: ChangeEntityFn<TEntity>): void {
    if (!entityId) return;
    const entity = getState().entities[entityType]?.store[entityId] as TEntity | undefined;
    if (entity) {
      const newEntity = change(entity);
      dispatch(importEntities([newEntity], entityType));
    }
  }

  return { changeEntity };
}

export { useChangeEntity, type ChangeEntityFn };