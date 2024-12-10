/**
 * Attachment normalizer:
 * Converts API attachments into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/attachment/}
 */
import { Attachment } from 'soapbox/types/entities.ts';

// https://docs.joinmastodon.org/entities/attachment/
export const AttachmentRecord = (attachment = {}) => ({
  blurhash: undefined as string | undefined,
  description: '',
  id: '',
  meta: {},
  pleroma: {},
  preview_url: '',
  remote_url: null,
  type: 'unknown',
  url: '',

  // Internal fields
  // TODO: Remove these? They're set in selectors/index.js
  account: null,
  status: null,

  ...attachment,
});

// Ensure attachments have required fields
const normalizeUrls = (attachment: Attachment) => {
  const url = [
    attachment.url,
    attachment.preview_url,
    attachment.remote_url,
  ].find(url => url) || '';

  const base = {
    url,
    preview_url: url,
  };

  return {
    ...attachment,
    url: attachment.url !== undefined ? attachment.url : base.url,
    preview_url: attachment.preview_url !== undefined ? attachment.preview_url : base.preview_url,
  };
};

// Ensure meta is not null
const normalizeMeta = (attachment: Attachment) => {
  const meta = { ...attachment.meta };

  return {
    ...attachment,
    meta: meta,
  };
};

export const normalizeAttachment = (attachment: Record<string, any>) => {
  let normalizedAttachment: Attachment = AttachmentRecord(attachment);

  normalizedAttachment = normalizeUrls(normalizedAttachment);
  normalizedAttachment = normalizeMeta(normalizedAttachment);

  return normalizedAttachment;
};