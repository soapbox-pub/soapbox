import { useInfiniteQuery, useMutation, keepPreviousData } from '@tanstack/react-query';

import { fetchRelationships } from 'soapbox/actions/accounts.ts';
import { importFetchedAccounts } from 'soapbox/actions/importer/index.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';

import { PaginatedResult, removePageItem } from '../utils/queries.ts';

import type { Account } from 'soapbox/schemas/account.ts';

type Suggestion = {
  source: string;
  account: Account;
}

type Result = {
  source: string;
  account: string;
}

type PageParam = {
  link?: string;
}

const SuggestionKeys = {
  suggestions: ['suggestions'] as const,
  localSuggestions: ['suggestions', 'local'] as const,
};

interface UseSuggestionsOpts {
  local?: boolean;
}

const useSuggestions = (opts?: UseSuggestionsOpts) => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const local = opts?.local ?? false;

  const getV2Suggestions = async (pageParam?: PageParam): Promise<PaginatedResult<Result>> => {
    const endpoint = pageParam?.link || (local ? '/api/v2/ditto/suggestions/local' : '/api/v2/suggestions');
    const response = await api.get(endpoint);
    const next = response.next();

    const data: Suggestion[] = await response.json();
    const accounts = data.map(({ account }) => account);
    const accountIds = accounts.map((account) => account.id);

    dispatch(importFetchedAccounts(accounts));
    dispatch(fetchRelationships(accountIds));

    return {
      result: data.map(x => ({ ...x, account: x.account.id })),
      link: next ?? undefined,
      hasMore: !!next,
    };
  };

  const result = useInfiniteQuery({
    queryKey: local ? SuggestionKeys.localSuggestions : SuggestionKeys.suggestions,
    queryFn: ({ pageParam }) => getV2Suggestions(pageParam),
    placeholderData: keepPreviousData,
    initialPageParam: undefined as PageParam | undefined,
    getNextPageParam: (config): PageParam | undefined => {
      if (config?.hasMore) {
        return { link: config?.link };
      }
    },
  });

  const data = result.data?.pages.reduce<Result[]>(
    (prev, curr) => [...prev, ...curr.result],
    [],
  );

  return {
    ...result,
    data: data || [],
  };
};

const useDismissSuggestion = () => {
  const api = useApi();

  return useMutation({
    mutationFn: (accountId: string) => api.delete(`/api/v1/suggestions/${accountId}`),
    onMutate(accountId: string) {
      removePageItem(SuggestionKeys.suggestions, accountId, (o: any, n: any) => o.account === n);
    },
  });
};

function useOnboardingSuggestions() {
  const api = useApi();
  const dispatch = useAppDispatch();

  const getV2Suggestions = async (pageParam: any): Promise<{ data: Suggestion[]; link: string | undefined; hasMore: boolean }> => {
    const link = pageParam?.link || '/api/v2/suggestions';
    const response = await api.get(link);
    const next = response.next();
    const hasMore = !!next;

    const data: Suggestion[] = await response.json();
    const accounts = data.map(({ account }) => account);
    const accountIds = accounts.map((account) => account.id);
    dispatch(importFetchedAccounts(accounts));
    dispatch(fetchRelationships(accountIds));

    return {
      data: data,
      link: next ?? undefined,
      hasMore,
    };
  };

  const result = useInfiniteQuery({
    queryKey: ['suggestions', 'v2'],
    queryFn: ({ pageParam }) => getV2Suggestions(pageParam),
    placeholderData: keepPreviousData,
    initialPageParam: { link: undefined as string | undefined },
    getNextPageParam: (config) => {
      if (config.hasMore) {
        return { link: config.link };
      }

      return undefined;
    },
  });

  const data = result.data?.pages.reduce<Suggestion[]>(
    (prev: Suggestion[], curr) => [...prev, ...curr.data],
    [],
  );

  return {
    ...result,
    data,
  };
}


export { useOnboardingSuggestions, useSuggestions, useDismissSuggestion };