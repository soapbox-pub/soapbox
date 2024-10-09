import { useQuery } from '@tanstack/react-query';

import { useApi } from 'soapbox/hooks';

type Embed = {
  type: string;
  version: string;
  author_name: string;
  author_url: string;
  provider_name: string;
  provider_url: string;
  cache_age: number;
  html: string;
  width: number;
  height: number;
}

/** Fetch OEmbed information for a status by its URL. */
// https://github.com/mastodon/mastodon/blob/main/app/controllers/api/oembed_controller.rb
// https://github.com/mastodon/mastodon/blob/main/app/serializers/oembed_serializer.rb
export default function useEmbed(url: string) {
  const api = useApi();

  const getEmbed = async (): Promise<Embed> => {
    return api.get<Embed>('/api/oembed', { searchParams: { url } }).json();
  };

  return useQuery<Embed>({
    queryKey: ['embed', url],
    queryFn: getEmbed,
  });
}
