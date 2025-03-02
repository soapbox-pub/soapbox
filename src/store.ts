import { configureStore, Tuple } from '@reduxjs/toolkit';
import { thunk, type ThunkDispatch } from 'redux-thunk';

import errorsMiddleware from './middleware/errors.ts';
import soundsMiddleware from './middleware/sounds.ts';
import appReducer from './reducers/index.ts';

import type { AnyAction } from 'redux';

const loadState = () => {
  try {
    const savedState = localStorage.getItem('soapbox:explorer:filters');
    return savedState ? JSON.parse(savedState) : undefined;
  } catch (error) {
    console.error('Failed to load state:', error);
    return undefined;
  }
};

const preloadedState = { ...loadState() ? { search_filter: loadState() } : {}  };

export const store = configureStore({
  reducer: appReducer,
  preloadedState,
  middleware: () => new Tuple(
    thunk,
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
