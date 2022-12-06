import { useMutation, useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';

export type Avatar = {
  account_id: string
  account_avatar: string
  acct: string
  seen: boolean
}

const CarouselKeys = {
  avatars: ['carouselAvatars'] as const,
};

function useCarouselAvatars() {
  const api = useApi();

  const getCarouselAvatars = async() => {
    const { data } = await api.get('/api/v1/truth/carousels/avatars');
    return data;
  };

  const result = useQuery<Avatar[]>(CarouselKeys.avatars, getCarouselAvatars, {
    placeholderData: [],
    keepPreviousData: true,
  });

  const avatars = result.data;

  return {
    ...result,
    data: avatars || [],
  };
}

function useMarkAsSeen() {
  const api = useApi();

  return useMutation((account_id: string) => api.post('/api/v1/truth/carousels/avatars/seen', {
    account_id,
  }));
}

export { useCarouselAvatars, useMarkAsSeen };