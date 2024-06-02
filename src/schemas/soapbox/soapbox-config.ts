/* eslint sort-keys: "error" */
import { z } from 'zod';

import { hexColorSchema } from '../utils';

export const cryptoAddressSchema = z.object({
  address: z.string(),
  note: z.string().optional(),
  ticker: z.string(),
});

export const footerItemSchema = z.object({
  title: z.string(),
  url: z.string().url(),
});

export const promoItemSchema = z.object({
  icon: z.string(),
  text: z.string(),
  textLocales: z.record(z.string()).optional(),
  url: z.string().url(),
});

/**
 * Soapbox Config schema.
 * All values must be optional. Defaults are set in a separate step.
 */
export const soapboxConfigSchema = z.object({
  accentColor: hexColorSchema.optional().catch(undefined),
  allowedEmoji: z.string().array().optional().catch(undefined),
  appleAppId: z.string().optional().catch(undefined),
  authProvider: z.string().optional().catch(undefined),
  authenticatedProfile: z.boolean().optional().catch(undefined),
  brandColor: hexColorSchema.optional().catch(undefined),
  copyright: z.string().optional().catch(undefined),
  cryptoAddresses: cryptoAddressSchema.array().optional().catch(undefined),
  cryptoDonatePanel: z.object({
    limit: z.number().nonnegative().optional().catch(undefined),
  }).optional().catch(undefined),
  defaultSettings: z.record(z.string(), z.unknown()).optional().catch(undefined),
  displayCta: z.boolean().optional().catch(undefined),
  displayFqn: z.boolean().optional().catch(undefined),
  extensions: z.object({
    patron: z.object({
      enabled: z.boolean().optional().catch(undefined),
    }).optional().catch(undefined),
  }).optional().catch(undefined),
  /** Whether to inject suggested profiles into the Home feed. */
  feedInjection: z.boolean().optional().catch(undefined),
  gdpr: z.boolean().optional().catch(undefined),
  gdprUrl: z.string().optional().catch(undefined),
  greentext: z.boolean().optional().catch(undefined),
  linkFooterMessage: z.boolean().optional().catch(undefined),
  links: z.record(z.string(), z.string()).optional().catch(undefined),
  logo: z.string().url().optional().catch(undefined),
  logoDarkMode: z.string().url().optional().catch(undefined),
  /**
   * Whether to use the preview URL for media thumbnails.
   * On some platforms this can be too blurry without additional configuration.
   */
  mediaPreview: z.boolean().optional().catch(undefined),
  navlinks: z.object({
    homeFooter: footerItemSchema.array().optional().catch(undefined),
  }).optional().catch(undefined),
  promoPanel: z.object({
    items: z.array(promoItemSchema),
  }).optional().catch(undefined),
  redirectRootNoLogin: z.string().optional().catch(undefined),
  sentryDsn: z.string().url().optional().catch(undefined),
  tileServer: z.string().optional().catch(undefined),
  tileServerAttribution: z.string().optional().catch(undefined),
  verifiedCanEditName: z.boolean().optional().catch(undefined),
  verifiedIcon: z.string().url().optional().catch(undefined),
});