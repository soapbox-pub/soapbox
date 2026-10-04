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
});
