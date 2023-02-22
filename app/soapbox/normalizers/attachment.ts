/**
 * Attachment normalizer:
 * Converts API attachments into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/Attachment/}
 */
import { Map as ImmutableMap, fromJS } from 'immutable';
import { z } from 'zod';

export const AttachmentSchema = z.object({
  blurhash: z.string().optional(),
  description: z.string().default(''),
  external_video_id: z.string().nullable().default(null), // TruthSocial
  id: z.string().default(''),
  meta: z.any().transform(v => ImmutableMap(fromJS(v))).default(ImmutableMap()),
  pleroma: z.object({
    mime_type: z.string().default('application/octet-stream'),
  }).default({
    mime_type: 'application/octet-stream',
  }),
  preview_url: z.string().default(''),
  remote_url: z.string().nullable().default(null),
  type: z.string().default('unknown'),
  url: z.string().default(''),

  // Internal fields
  // TODO: Remove these? They're set in selectors/index.js
  account: z.any(),
  status: z.any(),
}).transform(attachment => {
  const url = [
    attachment.url,
    attachment.preview_url,
    attachment.remote_url,
  ].find(Boolean) || '';

  attachment.url = attachment.url || url;
  attachment.preview_url = attachment.preview_url || url;

  return attachment;
});

export const normalizeAttachment = (attachment: Record<string, any>) => {
  return AttachmentSchema.parse(attachment);
};
