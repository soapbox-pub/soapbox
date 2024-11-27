import z from 'zod';

/** Ensure HTML content is a string, and drop empty `<p>` tags. */
const contentSchema = z.string().catch('').transform((value) => value === '<p></p>' ? '' : value);

/** Validate to Mastodon's date format, or use the current date. */
const dateSchema = z.string().datetime().catch(new Date().toUTCString());

/** Validates individual items in an array, dropping any that aren't valid. */
function filteredArray<T extends z.ZodTypeAny>(schema: T) {
  return z.any().array().catch([])
    .transform((arr) => (
      arr.map((item) => {
        const parsed = schema.safeParse(item);
        return parsed.success ? parsed.data : undefined;
      }).filter((item): item is z.infer<T> => Boolean(item))
    ));
}

/** Validates the string as an emoji. */
const emojiSchema = z.string().refine((v) => /\p{Extended_Pictographic}|[\u{1F1E6}-\u{1F1FF}]{2}/u.test(v));

function jsonSchema(reviver?: (this: any, key: string, value: any) => any) {
  return z.string().transform((value, ctx) => {
    try {
      return JSON.parse(value, reviver) as unknown;
    } catch (_e) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid JSON' });
      return z.NEVER;
    }
  });
}

/** MIME schema, eg `image/png`. */
const mimeSchema = z.string().regex(/^\w+\/[-+.\w]+$/);

/** zod schema to force the value into an object, if it isn't already. */
function coerceObject<T extends z.ZodRawShape>(shape: T) {
  return z.object({}).passthrough().catch({}).pipe(z.object(shape));
}

/** Validates a hex color code. */
const hexColorSchema = z.string().regex(/^#([a-f0-9]{3}|[a-f0-9]{4}|[a-f0-9]{6}|[a-f0-9]{8})$/i);

export { filteredArray, hexColorSchema, emojiSchema, contentSchema, dateSchema, jsonSchema, mimeSchema, coerceObject };