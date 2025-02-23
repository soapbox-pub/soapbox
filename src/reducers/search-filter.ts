import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface IFilters {
  name: string;
  state: boolean;
  value: string;
}

const initialState: IFilters[] = [
  { name: 'Nostr', state: true, value: 'protocol:nostr' },
  { name: 'Bluesky', state: true, value: 'protocol:atproto' },
  { name: 'Fediverse', state: true, value: 'protocol:activitypub' },
  { name: 'Global', state: false, value: 'language' },
  { name: 'Reply', state: false, value: 'reply:true' },
  { name: 'Media', state: false, value: 'media:true' },
  { name: 'Video', state: false, value: 'video:true' },
];

const search_filter = createSlice({
  name: 'search_filter',
  initialState,
  reducers: {
    handleToggleReplies: (state, action: PayloadAction<boolean>) => {
      return state.map((prevEstate) => {
        const checked = action.payload;
        return prevEstate.name.toLowerCase() === 'reply'
          ?
          {
            ...prevEstate,
            state: checked,
            value: `reply:${checked}`,
          }
          :
          prevEstate;
      },
      );
    },
    resetFilters: () => initialState,
  },
});

export const { handleToggleReplies, resetFilters } = search_filter.actions;
export default search_filter.reducer;