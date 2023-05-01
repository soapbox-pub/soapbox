import { useGroups } from 'soapbox/api/hooks';

import { useFeatures } from './useFeatures';

/**
 * Determine the correct URL to use for /groups.
 * If the user does not have any Groups, let's default to the discovery tab.
 * Otherwise, let's default to My Groups.
 *
 * @returns String (as link)
 */
const useGroupsPath = () => {
  const features = useFeatures();
  const { groups } = useGroups();

  if (!features.groupsDiscovery) {
    return '/groups';
  }

  return groups.length > 0 ? '/groups' : '/groups/discover';
};

export { useGroupsPath };