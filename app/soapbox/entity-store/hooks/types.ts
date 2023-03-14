import type { Entity } from '../types';
import type z from 'zod';

type EntitySchema<TEntity extends Entity = Entity> = z.ZodType<TEntity, z.ZodTypeDef, any>;

export type { EntitySchema };