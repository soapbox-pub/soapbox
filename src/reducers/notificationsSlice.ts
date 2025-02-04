import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  home: boolean;
  public: boolean;
  instance: boolean;
}

const initialState: NotificationState = {
  home: false,
  public: false,
  instance: false,
};

const notificationsTab = createSlice({
  name: 'notificationsSlice',
  initialState,
  reducers: {
    setNotification: (
      state,
      action: PayloadAction<{ timelineId: string; value: boolean }>,
    ) => {
      if (action.payload.timelineId in state) {
        state[action.payload.timelineId as keyof NotificationState] = action.payload.value;
      }
    },
    resetNotifications: (state) => {
      state.home = false;
      state.public = false;
      state.instance = false;
    },
  },
});

export const { setNotification, resetNotifications } = notificationsTab.actions;
export default notificationsTab.reducer;