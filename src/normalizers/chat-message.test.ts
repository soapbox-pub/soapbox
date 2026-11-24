import { describe, expect, it } from 'vitest';

import { normalizeAttachment } from './attachment.ts';
import { normalizeChatMessage } from './chat-message.ts';

describe('normalizeChatMessage()', () => {
  it('upgrades attachment to media_attachments', () => {
    const message = {
      id: 'abc',
      attachment: normalizeAttachment({
        id: 'def',
        url: 'https://gleasonator.com/favicon.png',
      }),
    };

    const result = normalizeChatMessage(message);

    expect(result.id).toEqual('abc');
    expect(result.media_attachments[0]?.id).toEqual('def');
    expect(result.media_attachments[0]?.preview_url).toEqual('https://gleasonator.com/favicon.png');
  });

  it('sanitizes HTML content from the server', () => {
    const result = normalizeChatMessage({
      id: 'abc',
      content: '<p>hi <img src="x" onerror="alert(1)"><script>alert(2)</script></p>',
    });

    expect(result.content).toEqual('<p>hi <img src="x"></p>');
  });

  it('leaves pending content alone, to be escaped at render time', () => {
    const result = normalizeChatMessage({
      id: 'abc',
      content: 'a & b <3',
      pending: true,
    });

    expect(result.content).toEqual('a & b <3');
  });
});
