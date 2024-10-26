import { configureStore, type AnyAction, type ThunkDispatch } from '@reduxjs/toolkit';

import errorsMiddleware from './middleware/errors';
import soundsMiddleware from './middleware/sounds';
import appReducer from './reducers';

export const store = configureStore({
  reducer: appReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      errorsMiddleware(),
      soundsMiddleware(),
    ),
  devTools: true,
});

export type Store = typeof store;

// Infer the `RootState` and `AppDispatch` types from the store itself
// https://redux.js.org/usage/usage-with-typescript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<RootState, {}, AnyAction>;
