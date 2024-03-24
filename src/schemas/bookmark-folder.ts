import { z } from 'zod';

/** Pleroma bookmark folder. */
const bookmarkFolderSchema = z.object({
  emoji: z.string().optional().catch(undefined),
  emoji_url: z.string().optional().catch(undefined),
  name: z.string().catch(''),
  id: z.string(),
});

type BookmarkFolder = z.infer<typeof bookmarkFolderSchema>;

export { bookmarkFolderSchema, type BookmarkFolder };