import type { EntitiesPath, ExpandedEntitiesPath } from './types';

function parseEntitiesPath(expandedPath: ExpandedEntitiesPath): EntitiesPath {
  const [entityType, ...listKeys] = expandedPath;
  const listKey = (listKeys || []).join(':');
  return [entityType, listKey];
}

export { parseEntitiesPath };