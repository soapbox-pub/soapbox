/**
 * Attachment normalizer:
 * Converts API attachments into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/Attachment/}
 */
import { z } from 'zod';

export const AttachmentSchema = z.object({
  blurhash: z.string().catch(''),
  description: z.string().catch(''),
  external_video_id: z.string().nullable().catch(null), // TruthSocial
  id: z.string().catch(''),
  meta: z.object({
    original: z.object({
      width: z.number(),
      height: z.number(),
      aspect: z.number().optional(),
      duration: z.number().optional().catch(undefined),
    }).transform(size => ({
      ...size,
      aspect: size.aspect ?? (size.width / size.height),
    })).optional().catch(undefined),
    focus: z.object({
      x: z.number(),
      y: z.number(),
    }).optional().catch({
      x: 0,
      y: 0,
    }),
    colors: z.object({
      background: z.string(),
      foreground: z.string(),
      accent: z.string(),
    }).optional().catch(undefined),
  }).catch({}),
  pleroma: z.object({
    mime_type: z.string(),
  }).catch({
    mime_type: 'application/octet-stream',
  }),
  preview_url: z.string().catch(''),
  remote_url: z.string().nullable().catch(null),
  type: z.string().catch('unknown'),
  url: z.string().catch(''),

  // Internal fields
  // TODO: Remove these? They're set in selectors/index.js
  account: z.any().default({}),
  status: z.any().default({}),
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
  return AttachmentSchema.parse('toJS' in attachment ? attachment.toJS() : attachment);
};
