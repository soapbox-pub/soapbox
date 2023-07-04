import { useInfiniteQuery, useMutation } from '@tanstack/react-query';

import { fetchRelationships } from 'soapbox/actions/accounts';
import { importFetchedAccounts } from 'soapbox/actions/importer';
import { SuggestedProfile } from 'soapbox/actions/suggestions';
import { getLinks } from 'soapbox/api';
import { useApi, useAppDispatch, useFeatures } from 'soapbox/hooks';

import { PaginatedResult, removePageItem } from '../utils/queries';

import type { IAccount } from './accounts';

type Suggestion = {
  source: 'staff'
  account: IAccount
}

type TruthSuggestion = {
  account_avatar: string
  account_id: string
  acct: string
  display_name: string
  note: string
  verified: boolean
}

type Result = TruthSuggestion | {
  account: string
}

type PageParam = {
  link?: string
}

const SuggestionKeys = {
  suggestions: ['suggestions'] as const,
};

const mapSuggestedProfileToAccount = (suggestedProfile: SuggestedProfile) => ({
  id: suggestedProfile.account_id,
  avatar: suggestedProfile.account_avatar,
  avatar_static: suggestedProfile.account_avatar,
  acct: suggestedProfile.acct,
  display_name: suggestedProfile.display_name,
  note: suggestedProfile.note,
  verified: suggestedProfile.verified,
});

const useSuggestions = () => {
  const api = useApi();
  const dispatch = useAppDispatch();
  const features = useFeatures();

  const getV2Suggestions = async (pageParam: PageParam): Promise<PaginatedResult<Result>> => {
    const endpoint = pageParam?.link || '/api/v2/suggestions';
    const response = await api.get<Suggestion[]>(endpoint);
    const hasMore = !!response.headers.link;
    const nextLink = getLinks(response).refs.find(link => link.rel === 'next')?.uri;

    const accounts = response.data.map(({ account }) => account);
    const accountIds = accounts.map((account) => account.id);
    dispatch(importFetchedAccounts(accounts));
    dispatch(fetchRelationships(accountIds));

    return {
      result: response.data.map(x => ({ ...x, account: x.account.id })),
      link: nextLink,
      hasMore,
    };
  };

  const getTruthSuggestions = async (pageParam: PageParam): Promise<PaginatedResult<Result>> => {
    const endpoint = pageParam?.link || '/api/v1/truth/carousels/suggestions';
    const response = await api.get<TruthSuggestion[]>(endpoint);
    const hasMore = !!response.headers.link;
    const nextLink = getLinks(response).refs.find(link => link.rel === 'next')?.uri;

    const accounts = response.data.map(mapSuggestedProfileToAccount);
    dispatch(importFetchedAccounts(accounts, { should_refetch: true }));

    return {
      result: response.data.map((x) => ({ ...x, account: x.account_id })),
      link: nextLink,
      hasMore,
    };
  };

  const getSuggestions = (pageParam: PageParam) => {
    if (features.truthSuggestions) {
      return getTruthSuggestions(pageParam);
    } else {
      return getV2Suggestions(pageParam);
    }
  };

  const result = useInfiniteQuery(
    SuggestionKeys.suggestions,
    ({ pageParam }: any) => getSuggestions(pageParam),
    {
      keepPreviousData: true,
      getNextPageParam: (config) => {
        if (config?.hasMore) {
          return { nextLink: config?.link };
        }

        return undefined;
      },
    });

  const data: any = result.data?.pages.reduce<Suggestion[]>(
    (prev: any, curr: any) => [...prev, ...curr.result],
    [],
  );

  return {
    ...result,
    data: data || [],
  };
};

const useDismissSuggestion = () => {
  const api = useApi();

  return useMutation((accountId: string) => api.delete(`/api/v1/suggestions/${accountId}`), {
    onMutate(accountId: string) {
      removePageItem(SuggestionKeys.suggestions, accountId, (o: any, n: any) => o.account === n);
    },
  });
};

function useOnboardingSuggestions() {
  const api = useApi();
  const dispatch = useAppDispatch();

  const getV2Suggestions = async (pageParam: any): Promise<{ data: Suggestion[], link: string | undefined, hasMore: boolean }> => {
    const link = pageParam?.link || '/api/v2/suggestions';
    const response = await api.get<Suggestion[]>(link);
    const hasMore = !!response.headers.link;
    const nextLink = getLinks(response).refs.find(link => link.rel === 'next')?.uri;

    const accounts = response.data.map(({ account }) => account);
    const accountIds = accounts.map((account) => account.id);
    dispatch(importFetchedAccounts(accounts));
    dispatch(fetchRelationships(accountIds));

    return {
      data: response.data,
      link: nextLink,
      hasMore,
    };
  };

  const result = useInfiniteQuery(['suggestions', 'v2'], ({ pageParam }) => getV2Suggestions(pageParam), {
    keepPreviousData: true,
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