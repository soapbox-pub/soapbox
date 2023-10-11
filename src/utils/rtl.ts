/** Unicode character ranges for RTL characters. */
const rtlChars = /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/mg;

/**
 * Check if text is right-to-left (eg Arabic).
 *
 * - U+0590 to U+05FF - Hebrew
 * - U+0600 to U+06FF - Arabic
 * - U+0700 to U+074F - Syriac
 * - U+0750 to U+077F - Arabic Supplement
 * - U+0780 to U+07BF - Thaana
 * - U+07C0 to U+07FF - N'Ko
 * - U+0800 to U+083F - Samaritan
 * - U+08A0 to U+08FF - Arabic Extended-A
 * - U+FB1D to U+FB4F - Hebrew presentation forms
 * - U+FB50 to U+FDFF - Arabic presentation forms A
 * - U+FE70 to U+FEFF - Arabic presentation forms B
 */
function isRtl(text: string, confidence = 0.3): boolean {
  if (text.length === 0) {
    return false;
  }

  // Remove http(s), (s)ftp, ws(s), blob and smtp(s) links
  text = text.replace(/(?:https?|ftp|sftp|ws|wss|blob|smtp|smtps):\/\/[\S]+/g, '');
  // Remove email address links
  text = text.replace(/(mailto:)([^\s@]+@[^\s@]+\.[^\s@]+)/g, '');
  // Remove phone number links
  text = text.replace(/(tel:)([+\d\s()-]+)/g, '');
  // Remove mentions
  text = text.replace(/(?:^|[^/\w])@([a-z0-9_]+(@[a-z0-9.-]+)?)/ig, '');
  // Remove hashtags
  text = text.replace(/(?:^|[^/\w])#([\S]+)/ig, '');
  // Remove all non-word characters
  text = text.replace(/\s+/g, '');

  const matches = text.match(rtlChars);

  if (!matches) {
    return false;
  }

  return matches.length / text.length > confidence;
}

interface GetTextDirectionOpts {
  /** The default direction to return if the text is empty. */
  fallback?: 'ltr' | 'rtl';
  /** The confidence threshold (0-1) to use when determining the direction. */
  confidence?: number;
}

/** Get the direction of the text. */
function getTextDirection(text: string, { fallback = 'ltr', confidence }: GetTextDirectionOpts = {}): 'ltr' | 'rtl' {
  if (!text) return fallback;
  return isRtl(text, confidence) ? 'rtl' : 'ltr';
}

export { getTextDirection, isRtl };