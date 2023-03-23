import type { EntitiesPath, EntityRequest, ExpandedEntitiesPath } from './types';
import type { AxiosRequestConfig } from 'axios';

function parseEntitiesPath(expandedPath: ExpandedEntitiesPath) {
  const [entityType, ...listKeys] = expandedPath;
  const listKey = (listKeys || []).join(':');
  const path: EntitiesPath = [entityType, listKey];

  return {
    entityType,
    listKey,
    path,
  };
}

function toAxiosRequest(req: EntityRequest): AxiosRequestConfig {
  if (typeof req === 'string' || req instanceof URL) {
    return {
      method: 'get',
      url: req.toString(),
    };
  }

  return req;
}

export { parseEntitiesPath, toAxiosRequest };