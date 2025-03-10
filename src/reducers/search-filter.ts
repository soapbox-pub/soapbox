import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface IFilters {
  name: string;
  status: boolean;
  value: string;
}

interface IToggle {
  value: string;
  status: boolean;
}

interface INewFilter {
  name: string;
  status: boolean;
}

const initialState: IFilters[] = [
  { name: 'default', status: false, value: 'language:default' },
  { name: 'Nostr', status: true, value: 'protocol:nostr' },
  { name: 'Bluesky', status: true, value: 'protocol:atproto' },
  { name: 'Fediverse', status: true, value: 'protocol:activitypub' },
  { name: 'No Replies', status: false, value: 'reply:false' },
  { name: 'Video only', status: false, value: 'video:true' },
  { name: 'Image only', status: false, value: 'media:true -video:true' },
  { name: 'No media', status: false, value: '-media:true' },
];

const search_filter = createSlice({
  name: 'search_filter',
  initialState,
  reducers: {
    /**
     * Toggles the status of reply filter.
     */
    changeStatus: (state, action: PayloadAction<IToggle>) => {
      return state.map((currentState) => {
        const status = action.payload.status;
        const value = action.payload.value;
        return currentState.value === value
          ? {
            ...currentState,
            status: status,
          }
          : currentState;
      });
    },

    /**
     * Changes the media filter.
     */
    changeMedia: (state, action: PayloadAction<string>) => {
      const selected = action.payload.toLowerCase();

      const resetMediaState = state.map((currentFilter, index) => {
        return index > 3 && index <= 7
          ? {
            ...currentFilter,
            status: false,
          }
          : currentFilter;
      });

      const applyMediaFilter = (searchFilter: string) => {
        return resetMediaState.map((currentState) =>
          currentState.name.toLowerCase().includes(searchFilter)
            ? {
              ...currentState,
              status: true,
            }
            : currentState,
        );
      };

      switch (selected) {
        case 'text':
        case 'video':
        case 'image':
          return applyMediaFilter(`${selected} only`);
        case 'none':
          return applyMediaFilter('no media');
        default:
          return resetMediaState;
      }
    },

    /**
     * Changes the language filter.
     */
    changeLanguage: (state, action: PayloadAction<string>) => {
      const selected = action.payload.toLowerCase();
      const isDefault = selected === 'default';
      return state.map((currentState) =>
        currentState.value.includes('language:')
          ? {
            name: isDefault ? selected : selected.toUpperCase(),
            status: !isDefault,
            value: `language:${selected}`,
          }
          : currentState,
      );
    },

    /**
     * Toggles the status of a protocol filter.
     */
    selectProtocol: (state, action: PayloadAction<string>) => {
      const protocol = action.payload;
      return state.map((currentState) => {
        const newStatus = !currentState.status;
        if (currentState.value.toLowerCase() !== protocol) return currentState;
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
      return state.filter((filter) => filter.name.toLowerCase() !== action.payload);
    },

    /**
     * Resets the filters to the initial state.
     */
    resetFilters: () => initialState,
  },
});

export type { IFilters };
export { initialState };
export const { changeStatus, changeMedia, changeLanguage, selectProtocol, createFilter, removeFilter, resetFilters } = search_filter.actions;
export default search_filter.reducer;