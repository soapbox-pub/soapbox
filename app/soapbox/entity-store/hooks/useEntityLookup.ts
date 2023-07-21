import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { useAppDispatch, useAppSelector, useLoading } from 'soapbox/hooks';

import { importEntities } from '../actions';
import { findEntity } from '../selectors';
import { Entity } from '../types';

import { EntityFn } from './types';
import { type UseEntityOpts } from './useEntity';

/** Entities will be filtered through this function until it returns true. */
type LookupFn<TEntity extends Entity> = (entity: TEntity) => boolean

function useEntityLookup<TEntity extends Entity>(
  entityType: string,
  lookupFn: LookupFn<TEntity>,
  entityFn: EntityFn<void>,
  opts: UseEntityOpts<TEntity> = {},
) {
  const { schema = z.custom<TEntity>() } = opts;

  const dispatch = useAppDispatch();
  const [isFetching, setPromise] = useLoading(true);
  const [error, setError] = useState<unknown>();

  const entity = useAppSelector(state => findEntity(state, entityType, lookupFn));
  const isEnabled = opts.enabled ?? true;
  const isLoading = isFetching && !entity;

  const fetchEntity = async () => {
    try {
      const response = await setPromise(entityFn());
      const entity = schema.parse(response.data);
      dispatch(importEntities([entity], entityType));
    } catch (e) {
      setError(e);
    }
  };

  useEffect(() => {
    if (!isEnabled) return;

    if (!entity || opts.refetch) {
      fetchEntity();
    }
  }, [isEnabled]);

  return {
    entity,
    fetchEntity,
    isFetching,
    isLoading,
    isUnauthorized: error instanceof AxiosError && error.response?.status === 401,
    isForbidden: error instanceof AxiosError && error.response?.status === 403,
  };
}

export { useEntityLookup };