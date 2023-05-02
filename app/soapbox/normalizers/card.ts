import { cardSchema, type Card } from 'soapbox/schemas/card';

export const normalizeCard = (card: unknown): Card => {
  try {
    return cardSchema.parse(card);
  } catch (_e) {
    return {
      author_name: '',
      author_url: '',
      blurhash: null,
      description: '',
      embed_url: '',
      group: null,
      height: 0,
      html: '',
      image: null,
      provider_name: '',
      provider_url: '',
      title: '',
      type: 'link',
      url: '',
      width: 0,
    };
  }
};
