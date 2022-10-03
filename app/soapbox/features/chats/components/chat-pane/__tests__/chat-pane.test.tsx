import React from 'react';
import { VirtuosoMockContext } from 'react-virtuoso';

import { __stub } from 'soapbox/api';
import { ChatContext } from 'soapbox/contexts/chat-context';
import { StatProvider } from 'soapbox/contexts/stat-context';
import chats from 'soapbox/jest/fixtures/chats.json';
import { render, rootState, screen, waitFor } from 'soapbox/jest/test-helpers';
import { normalizeInstance } from 'soapbox/normalizers';

import ChatPane from '../chat-pane';

const renderComponentWithChatContext = (store = {}) => render(
  <VirtuosoMockContext.Provider value={{ viewportHeight: 300, itemHeight: 100 }}>
    <StatProvider>
      <ChatContext.Provider value={{ isOpen: true }}>
        <ChatPane />
      </ChatContext.Provider>
    </StatProvider>
  </VirtuosoMockContext.Provider>,
  undefined,
  store,
);

const store = rootState
  .set('instance', normalizeInstance({
    version: '3.4.1 (compatible; TruthSocial 1.0.0)',
  }));

describe('<ChatPane />', () => {
  describe('when there are chats', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/pleroma/chats').reply(200, chats, {
          link: '<https://example.com/api/v1/pleroma/chats?since_id=2>; rel=\'prev\'',
        });
      });
    });

    it('renders the chats', async () => {
      renderComponentWithChatContext();

      await waitFor(() => {
        expect(screen.getAllByTestId('chat-list-item')).toHaveLength(chats.length);
      });
    });
  });

  describe('when there are no chats', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/pleroma/chats').reply(200, [], {
          link: null,
        });
      });
    });

    it('renders the blankslate', async () => {
      renderComponentWithChatContext();

      await waitFor(() => {
        expect(screen.getByTestId('chat-pane-blankslate')).toBeInTheDocument();
      });
    });
  });

  describe('when the software is Truth Social', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/pleroma/chats').reply(200, chats, {
          link: '<https://example.com/api/v1/pleroma/chats?since_id=2>; rel=\'prev\'',
        });
      });
    });

    it('renders the search input', async () => {
      renderComponentWithChatContext(store);

      await waitFor(() => {
        expect(screen.getByTestId('chat-search-input')).toBeInTheDocument();
      });
    });
  });

  describe('when the software is not Truth Social', () => {
    beforeEach(() => {
      __stub((mock) => {
        mock.onGet('/api/v1/pleroma/chats').reply(200, chats, {
          link: '<https://example.com/api/v1/pleroma/chats?since_id=2>; rel=\'prev\'',
        });
      });
    });

    it('does not render the search input', async () => {
      renderComponentWithChatContext();

      await waitFor(() => {
        expect(screen.queryAllByTestId('chat-search-input')).toHaveLength(0);
      });
    });
  });
});