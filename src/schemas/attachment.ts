import { isBlurhashValid } from 'blurhash';
import { z } from 'zod';

import { mimeSchema } from './utils.ts';

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
  id: z.string(),
  pleroma: z.object({
    mime_type: mimeSchema,
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
]).transform(async (attachment) => {
  if (!attachment.preview_url) {
    attachment.preview_url = attachment.url;
  }

  if (attachment.type === 'image') {
    if (!attachment.meta.original) {
      try {
        const { width, height } = await getImageDimensions(attachment.url);
        attachment.meta.original = { width, height, aspect: width / height };
      } catch {
        // Image metadata is not available
      }
    }
  }

  if (attachment.type === 'video') {
    if (!attachment.meta.original) {
      try {
        const { width, height } = await getVideoDimensions(attachment.url);
        attachment.meta.original = { width, height, aspect: width / height };
      } catch {
        // Video metadata is not available
      }
    }
  }

  return attachment;
});

async function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  const response = await fetch(url);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src); // Cleanup
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
}

async function getVideoDimensions(url: string): Promise<{ width: number; height: number }> {
  const response = await fetch(url);
  const blob = await response.blob();

  return await new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      video.currentTime = 0.1; // Force processing of video frames
    };

    video.onseeked = () => {
      resolve({ width: video.videoWidth, height: video.videoHeight });
      URL.revokeObjectURL(video.src);
    };

    video.onerror = reject;
    video.src = URL.createObjectURL(blob);
  });
}

type Attachment = z.infer<typeof attachmentSchema>;

export { attachmentSchema, type Attachment };