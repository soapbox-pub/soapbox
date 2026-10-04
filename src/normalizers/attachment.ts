/**
 * Attachment normalizer:
 * Converts API attachments into our internal format.
 * @see {@link https://docs.joinmastodon.org/entities/attachment/}
 */
import { fromDefaults } from '@/utils/normalizers.ts';

interface AttachmentMetaSize {
  width?: number;
  height?: number;
  aspect?: number;
  size?: string;
  duration?: number;
  frame_rate?: string;
  bitrate?: number;
}

export interface AttachmentMeta {
  original?: AttachmentMetaSize;
  small?: AttachmentMetaSize;
  focus?: { x?: number; y?: number };
  duration?: number;
  colors?: { background?: string; foreground?: string; accent?: string };
  [key: string]: unknown;
}

// https://docs.joinmastodon.org/entities/attachment/
export interface Attachment {
  blurhash: string | null | undefined;
  description: string;
  id: string;
  meta: AttachmentMeta;
  pleroma: { mime_type?: string; [key: string]: unknown };
  preview_url: string;
  remote_url: string | null;
  type: string;
  url: string;

  // Internal fields
  // TODO: Remove these? They're set in selectors/index.js
  account: any;
  status: any;
}

export const normalizeAttachment = (attachment: Record<string, any>): Attachment => {
  const result = fromDefaults<Attachment>({
    blurhash: undefined,
    description: '',
    id: '',
    meta: {},
    pleroma: {},
    preview_url: '',
    remote_url: null,
    type: 'unknown',
    url: '',
    account: null,
    status: null,
  }, attachment);

  // Ensure attachments have required fields
  const url = [
    attachment.url,
    attachment.preview_url,
    attachment.remote_url,
  ].find(url => url) || '';

  result.url = attachment.url ?? url;
  result.preview_url = attachment.preview_url ?? url;

  // Ensure meta is not null
  result.meta = { ...attachment.meta };
  result.pleroma = { ...attachment.pleroma };

  return result;
};
