import { default as lodashGet } from 'lodash/get';

interface LegacyMap {
  get(key: any): unknown
  getIn(keyPath: any[]): unknown
  toJS(): any
}

interface LegacyStore<T> extends LegacyMap {
  get(key: any): T & LegacyMap | undefined
  getIn(keyPath: any[]): unknown
  find(predicate: (value: T & LegacyMap, key: string) => boolean): T & LegacyMap | undefined
  filter(predicate: (value: T & LegacyMap, key: string) => boolean): (T & LegacyMap)[]
}

function immutableizeEntity<T extends Record<any, any>>(entity: T): T & LegacyMap {
  return {
    ...entity,

    get(key: any): unknown {
      return entity[key];
    },

    getIn(keyPath: any[]): unknown {
      return lodashGet(entity, keyPath);
    },

    toJS() {
      return entity;
    },
  };
}

function immutableizeStore<T, S extends Record<string, T | undefined>>(state: S): S & LegacyStore<T> {
  return {
    ...state,

    get(id: any): T & LegacyMap | undefined {
      const entity = state[id];
      return entity ? immutableizeEntity(entity) : undefined;
    },

    getIn(keyPath: any[]): unknown {
      return lodashGet(state, keyPath);
    },

    find(predicate: (value: T & LegacyMap, key: string) => boolean): T & LegacyMap | undefined {
      const result = Object.entries(state).find(([key, value]) => value && predicate(immutableizeEntity(value), key))?.[1];
      return result ? immutableizeEntity(result) : undefined;
    },

    filter(predicate: (value: T & LegacyMap, key: string) => boolean): (T & LegacyMap)[] {
      return Object.entries(state).filter(([key, value]) => value && predicate(immutableizeEntity(value), key)).map(([key, value]) => immutableizeEntity(value!));
    },

    toJS() {
      return state;
    },
  };
}


export {
  immutableizeStore,
  immutableizeEntity,
  type LegacyMap,
  type LegacyStore,
};