import { groupSearchHistory } from 'soapbox/settings';

const RECENT_SEARCHES_KEY = 'soapbox:recent-group-searches';

const clearRecentGroupSearches = (currentUserId: string) => groupSearchHistory.remove(currentUserId);

const saveGroupSearch = (currentUserId: string, search: string) => {
  let currentSearches: string[] = [];

  if (groupSearchHistory.get(currentUserId)) {
    currentSearches = groupSearchHistory.get(currentUserId);
  }

  if (currentSearches.indexOf(search) === -1) {
    currentSearches.unshift(search);
    if (currentSearches.length > 10) {
      currentSearches.pop();
    }

    groupSearchHistory.set(currentUserId, currentSearches);

    return currentSearches;
  } else {
    // The search term has already been searched. Move it to the beginning
    // of the cached list.
    const indexOfSearch = currentSearches.indexOf(search);
    const nextCurrentSearches = [...currentSearches];
    nextCurrentSearches.splice(0, 0, ...nextCurrentSearches.splice(indexOfSearch, 1));
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextCurrentSearches));

    return nextCurrentSearches;
  }
};

export { clearRecentGroupSearches, saveGroupSearch };
