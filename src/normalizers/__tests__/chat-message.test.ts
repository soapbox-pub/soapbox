import { Record as ImmutableRecord } from 'immutable';

import { normalizeAttachment } from '../attachment';
import { normalizeChatMessage } from '../chat-message';

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

    expect(ImmutableRecord.isRecord(result)).toBe(true);
    expect(result.id).toEqual('abc');
    expect(result.media_attachments.first()?.id).toEqual('def');
    expect(result.media_attachments.first()?.preview_url).toEqual('https://gleasonator.com/favicon.png');
  });
});
