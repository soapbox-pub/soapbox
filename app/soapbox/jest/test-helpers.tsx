import { configureMockStore } from '@jedmao/redux-mock-store';
import { QueryClientProvider } from '@tanstack/react-query';
import { render, RenderOptions } from '@testing-library/react';
import { renderHook, RenderHookOptions } from '@testing-library/react-hooks';
import { merge } from 'immutable';
import React, { FC, ReactElement } from 'react';
import { Toaster } from 'react-hot-toast';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { Action, applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';
import '@testing-library/jest-dom';

import { ChatProvider } from 'soapbox/contexts/chat-context';
import { StatProvider } from 'soapbox/contexts/stat-context';
import { queryClient } from 'soapbox/queries/client';

import { default as rootReducer } from '../reducers';

import type { AnyAction } from 'redux';
import type { AppDispatch } from 'soapbox/store';

// Mock Redux
// https://redux.js.org/recipes/writing-tests/
const rootState = rootReducer(undefined, {} as Action);
const mockStore = configureMockStore<typeof rootState, AnyAction, AppDispatch>([thunk]);

/** Apply actions to the state, one at a time. */
const applyActions = (state: any, actions: any, reducer: any) => {
  return actions.reduce((state: any, action: any) => reducer(state, action), state);
};

const createTestStore = (initialState: any) => createStore(rootReducer, initialState, applyMiddleware(thunk));
const TestApp: FC<any> = ({ children, storeProps, routerProps = {} }) => {
  let store: ReturnType<typeof createTestStore>;
  let appState = rootState;

  if (storeProps && typeof storeProps.getState !== 'undefined') { // storeProps is a store
    store = storeProps;
  } else if (storeProps) { // storeProps is state
    appState = merge(rootState, storeProps);
    store = createTestStore(appState);
  } else {
    store = createTestStore(appState);
  }

  const props = {
    locale: 'en',
    store,
  };

  return (
    <div id='soapbox'>
      <Provider store={props.store}>
        <MemoryRouter {...routerProps}>
          <StatProvider>
            <QueryClientProvider client={queryClient}>
              <ChatProvider>
                <IntlProvider locale={props.locale}>
                  {children}

                  <Toaster />
                </IntlProvider>
              </ChatProvider>
            </QueryClientProvider>
          </StatProvider>
        </MemoryRouter>
      </Provider>
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
  store?: any,
  routerProps?: any,
) => render(ui, {
  wrapper: () => <TestApp children={ui} storeProps={store} routerProps={routerProps} />,
  ...options,
});

/** Like renderHook, but with access to the Redux store. */
const customRenderHook = <T extends { children?: React.ReactNode }>(
  callback: (props?: any) => any,
  options?: Omit<RenderHookOptions<T>, 'wrapper'>,
  store?: any,
) => {
  return renderHook(callback, {
    wrapper: ({ children }) => <TestApp children={children} storeProps={store} />,
    ...options,
  });
};

const mockWindowProperty = (property: any, value: any) => {
  const { [property]: originalProperty } = window;
  delete window[property];

  beforeAll(() => {
    Object.defineProperty(window, property, {
      configurable: true,
      writable: true,
      value,
    });
  });

  afterAll(() => {
    window[property] = originalProperty;
  });
};

export * from '@testing-library/react';
export {
  customRender as render,
  customRenderHook as renderHook,
  mockStore,
  applyActions,
  rootState,
  rootReducer,
  mockWindowProperty,
  createTestStore,
  queryClient,
};
