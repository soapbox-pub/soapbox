import type { EntitiesPath, ExpandedEntitiesPath } from './types.ts';

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

export { parseEntitiesPath };
