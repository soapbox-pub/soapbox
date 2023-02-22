import { normalizeAttachment } from '../attachment';

describe('normalizeAttachment()', () => {
  it('adds base fields', () => {
    const attachment = { id: '1' };
    const result = normalizeAttachment(attachment);

    expect(result.type).toEqual('unknown');
    expect(result.url).toEqual('');
  });

  it('infers preview_url from url', () => {
    const attachment = { id: '1', url: 'https://site.fedi/123.png' };
    const result = normalizeAttachment(attachment);

    expect(result.preview_url).toEqual('https://site.fedi/123.png');
  });
});
