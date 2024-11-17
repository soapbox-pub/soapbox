import { useQuery } from '@tanstack/react-query';

import { autosuggestPopulate } from 'soapbox/features/emoji/search.ts';
import { useApi } from 'soapbox/hooks/useApi.ts';
import { CustomEmoji, customEmojiSchema } from 'soapbox/schemas/custom-emoji.ts';
import { filteredArray } from 'soapbox/schemas/utils.ts';

/** Get the Instance for the current backend. */
export function useCustomEmojis() {
  const api = useApi();

  const { data: customEmojis = [], ...rest } = useQuery<CustomEmoji[]>({
    queryKey: ['customEmojis', api.baseUrl],
    queryFn: async () => {
      const response = await api.get('/api/v1/custom_emojis');
      const data = await response.json();
      const customEmojis = filteredArray(customEmojiSchema).parse(data);

      // Add custom emojis to the search index.
      autosuggestPopulate(customEmojis);

      return customEmojis;
    },
    placeholderData: [],
    retryOnMount: false,
  });

  return { customEmojis, ...rest };
}
