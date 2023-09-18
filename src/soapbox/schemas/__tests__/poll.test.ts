import { pollSchema } from '../poll';

describe('normalizePoll()', () => {
  it('adds base fields', () => {
    const poll = { id: '1', options: [{ title: 'Apples' }, { title: 'Oranges' }] };
    const result = pollSchema.parse(poll);

    const expected = {
      options: [
        { title: 'Apples', votes_count: 0 },
        { title: 'Oranges', votes_count: 0 },
      ],
      emojis: [],
      expired: false,
      multiple: false,
      voters_count: 0,
      votes_count: 0,
      own_votes: null,
      voted: false,
    };

    expect(result).toMatchObject(expected);
  });

  it('normalizes a Pleroma logged-out poll', () => {
    const { poll } = require('soapbox/__fixtures__/pleroma-status-with-poll.json');
    const result = pollSchema.parse(poll);

    // Adds logged-in fields
    expect(result.voted).toBe(false);
    expect(result.own_votes).toBe(null);
  });

  it('normalizes poll with emojis', () => {
    const { poll } = require('soapbox/__fixtures__/pleroma-status-with-poll-with-emojis.json');
    const result = pollSchema.parse(poll);

    // Emojifies poll options
    expect(result.options[1]?.title_emojified)
      .toContain('emojione');

    expect(result.emojis[1]?.shortcode).toEqual('soapbox');
  });
});
