import z from 'zod';

const screenshotsSchema = z.array(z.object({
  form_factor: z.enum(['narrow', 'wide']).optional(),
  label: z.string().optional(),
  platform: z.enum([
    'android',
    'chromeos',
    'ipados',
    'ios',
    'kaios',
    'macos',
    'windows',
    'xbox',
    'chrome_web_store',
    'itunes',
    'microsoft-inbox',
    'microsoft-store',
    'play',
  ]).optional(),
  /** https://developer.mozilla.org/en-US/docs/Web/Manifest/screenshots#sizes */
  sizes: z.string().refine((value) =>
    value.split(' ').every((v) => /^[1-9]\d{0,3}[xX][1-9]\d{0,3}$/.test(v)),
  ).optional(),
  /** Absolute URL. */
  src: z.string().url(),
  /** MIME type of the image. */
  type: z.string().optional(),
}));

type Screenshots = z.infer<typeof screenshotsSchema>;

export { screenshotsSchema, type Screenshots };