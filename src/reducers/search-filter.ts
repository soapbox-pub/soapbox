import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface IFilters {
  name: string;  // The name of the filter.
  status: boolean;  // Whether the filter is active or not.
  value: string;  // The filter value used for searching.
}

interface IToggle {
  type: string;  // The filter type to toggle.
  checked: boolean;  // The new status of the filter.
}

interface INewFilter {
  name: string;  // The name of the new filter.
  status: boolean;  // Whether the filter should be active by default.
}

const initialState: IFilters[] = [
  { name: 'Default', status: false, value: 'language:default' },
  { name: 'Nostr', status: true, value: 'protocol:nostr' },
  { name: 'Bluesky', status: true, value: 'protocol:atproto' },
  { name: 'Fediverse', status: true, value: 'protocol:activitypub' },
  { name: 'Reply', status: false, value: 'reply:true' },
  { name: 'Media', status: false, value: 'media:true' },
  { name: 'Video', status: false, value: 'video:true' },
];

const search_filter = createSlice({
  name: 'search_filter',
  initialState,
  reducers: {
    /**
     * Toggles the status of a filter.
     */
    handleToggle: (state, action: PayloadAction<IToggle>) => {
      return state.map((currentState) => {
        const checked = action.payload.checked;
        const type = action.payload.type.toLowerCase();
        return currentState.name.toLowerCase() === type
          ? {
            ...currentState,
            status: checked,
            value: `${type}:${checked}`,
          }
          : currentState;
      });
    },

    /**
     * Changes the language filter.
     */
    changeLanguage: (state, action: PayloadAction<string>) => {
      const selected = action.payload.toLowerCase();
      return state.map((currentState) =>
        currentState.value.includes('language:')
          ? {
            name: selected.toUpperCase(),
            status: selected !== 'default',
            value: `language:${selected}`,
          }
          : currentState,
      );
    },

    /**
     * Toggles the status of a protocol filter.
     */
    selectProtocol: (state, action: PayloadAction<string>) => {
      const protocol = action.payload.toLowerCase();
      return state.map((currentState) => {
        const newStatus = !currentState.status;
        if (currentState.name.toLowerCase() !== protocol) return currentState;
        return {
          ...currentState,
          status: newStatus,
          value: newStatus ? currentState.value.slice(1) : `-${currentState.value}`,
        };
      });
    },

    /**
     * Creates a new filter.
     */
    createFilter: (state, action: PayloadAction<INewFilter>) => {
      const filterWords = action.payload.name.trim();
      const status = action.payload.status;
      const value = status ? filterWords : `-${filterWords.split(' ').join(' -')}`;
      return state.some((currentState) => currentState.name === filterWords)
        ? state
        : [...state, { name: filterWords, status: status, value: value }];
    },

    /**
     * Removes a filter.
     */
    removeFilter: (state, action: PayloadAction<string>) => {
      return state.filter((filter) => filter.name !== action.payload);
    },

    /**
     * Resets the filters to the initial state.
     */
    resetFilters: () => initialState,
  },
});

export const { handleToggle, changeLanguage, selectProtocol, createFilter, removeFilter, resetFilters } = search_filter.actions;
export default search_filter.reducer;