import { isBlurhashValid } from 'blurhash';
import { z } from 'zod';

const blurhashSchema = z.string().superRefine((value, ctx) => {
  const r = isBlurhashValid(value);

  if (!r.result) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: r.errorReason,
    });
  }
});

const baseAttachmentSchema = z.object({
  blurhash: blurhashSchema.nullable().catch(null),
  description: z.string().catch(''),
  external_video_id: z.string().optional().catch(undefined), // TruthSocial
  id: z.string(),
  pleroma: z.object({
    mime_type: z.string().regex(/^\w+\/[-+.\w]+$/),
  }).optional().catch(undefined),
  preview_url: z.string().url().catch(''),
  remote_url: z.string().url().nullable().catch(null),
  type: z.string(),
  url: z.string().url(),
});

const imageMetaSchema = z.object({
  width: z.number(),
  height: z.number(),
  aspect: z.number().optional().catch(undefined),
}).transform((meta) => ({
  ...meta,
  aspect: typeof meta.aspect === 'number' ? meta.aspect : meta.width / meta.height,
}));

const imageAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('image'),
  meta: z.object({
    original: imageMetaSchema.optional().catch(undefined),
  }).catch({}),
});

const videoAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('video'),
  meta: z.object({
    duration: z.number().optional().catch(undefined),
    original: imageMetaSchema.optional().catch(undefined),
  }).catch({}),
});

const gifvAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('gifv'),
  meta: z.object({
    duration: z.number().optional().catch(undefined),
    original: imageMetaSchema.optional().catch(undefined),
  }).catch({}),
});

const audioAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('audio'),
  meta: z.object({
    duration: z.number().optional().catch(undefined),
    colors: z.object({
      background: z.string().optional().catch(undefined),
      foreground: z.string().optional().catch(undefined),
      accent: z.string().optional().catch(undefined),
      duration: z.number().optional().catch(undefined),
    }).optional().catch(undefined),
  }).catch({}),
});

const unknownAttachmentSchema = baseAttachmentSchema.extend({
  type: z.literal('unknown'),
});

/** https://docs.joinmastodon.org/entities/attachment */
const attachmentSchema = z.discriminatedUnion('type', [
  imageAttachmentSchema,
  videoAttachmentSchema,
  gifvAttachmentSchema,
  audioAttachmentSchema,
  unknownAttachmentSchema,
]).transform((attachment) => {
  if (!attachment.preview_url) {
    attachment.preview_url = attachment.url;
  }

  return attachment;
});

type Attachment = z.infer<typeof attachmentSchema>;

export { attachmentSchema, type Attachment };