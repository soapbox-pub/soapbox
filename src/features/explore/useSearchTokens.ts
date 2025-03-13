import { produce, enableMapSet } from 'immer';
import { create } from 'zustand';

enableMapSet();

interface SearchTokensState {
  tokens: Set<string>;
  addToken(token: string): void;
  addTokens(tokens: string[]): void;
  removeToken(token: string): void;
  removeTokens(tokens: string[]): void;
  clearTokens(): void;
}

export const useSearchTokens = create<SearchTokensState>()(
  (setState) => ({
    tokens: new Set(),

    addToken(token: string): void {
      setState((state) => {
        return produce(state, (draft) => {
          draft.tokens.add(token);
        });
      });
    },

    addTokens(tokens: string[]): void {
      setState((state) => {
        return produce(state, (draft) => {
          for (const token of tokens) {
            draft.tokens.add(token);
          }
        });
      });
    },

    removeToken(token: string): void {
      setState((state) => {
        return produce(state, (draft) => {
          draft.tokens.delete(token);
        });
      });
    },

    removeTokens(tokens: string[]): void {
      setState((state) => {
        return produce(state, (draft) => {
          for (const token of tokens) {
            draft.tokens.delete(token);
          }
        });
      });
    },

    clearTokens(): void {
      setState((state) => {
        return produce(state, (draft) => {
          draft.tokens.clear();
        });
      });
    },
  }),
);
