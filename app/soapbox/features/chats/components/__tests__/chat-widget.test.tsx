import { Map as ImmutableMap } from 'immutable';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { normalizeAccount } from 'soapbox/normalizers';

import { render, rootState } from '../../../../jest/test-helpers';
import ChatWidget from '../chat-widget/chat-widget';

const id = '1';
const account = normalizeAccount({
  id,
  acct: 'justin-username',
  display_name: 'Justin L',
  avatar: 'test.jpg',
  chats_onboarded: true,
});

const store = rootState
  .set('me', id)
  .set('accounts', ImmutableMap({
    [id]: account,
  }) as any);

describe('<ChatWidget />', () => {
  describe('when on the /chats endpoint', () => {
    it('hides the widget', async () => {
      const App = () => (
        <Switch>
          <Route path='/chats' exact><span>Chats page <ChatWidget /></span></Route>
          <Route path='/' exact><span data-testid='home'>Homepage <ChatWidget /></span></Route>
        </Switch>
      );

      const screen = render(
        <App />,
        {},
        store,
        { initialEntries: ['/chats'] },
      );

      expect(screen.queryAllByTestId('pane')).toHaveLength(0);
    });
  });

  describe('when the user has not onboarded chats', () => {
    it('hides the widget', async () => {
      const accountWithoutChats = normalizeAccount({
        id,
        acct: 'justin-username',
        display_name: 'Justin L',
        avatar: 'test.jpg',
        chats_onboarded: false,
      });
      const newStore = store.set('accounts', ImmutableMap({
        [id]: accountWithoutChats,
      }) as any);

      const screen = render(
        <ChatWidget />,
        {},
        newStore,
      );

      expect(screen.queryAllByTestId('pane')).toHaveLength(0);
    });
  });

  describe('when the user is onboarded and the endpoint is not /chats', () => {
    it('shows the widget', async () => {
      const App = () => (
        <Switch>
          <Route path='/chats' exact><span>Chats page <ChatWidget /></span></Route>
          <Route path='/' exact><span data-testid='home'>Homepage <ChatWidget /></span></Route>
        </Switch>
      );

      const screen = render(
        <App />,
        {},
        store,
        { initialEntries: ['/'] },
      );

      expect(screen.queryAllByTestId('pane')).toHaveLength(1);
    });
  });
});
