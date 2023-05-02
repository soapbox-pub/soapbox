import { cardSchema } from '../card';

describe('cardSchema', () => {
  it('adds base fields', () => {
    const card = { url: 'https://soapbox.test' };
    const result = cardSchema.parse(card);

    expect(result.type).toEqual('link');
    expect(result.url).toEqual(card.url);
  });
});
