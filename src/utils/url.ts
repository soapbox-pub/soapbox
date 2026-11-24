/**
 * Whether a URL is safe to use as a link or media source from untrusted data.
 *
 * `new URL()` (and so `z.string().url()`) happily accepts `javascript:` and `data:`
 * URLs, and React 18 still renders `javascript:` in `href`. Only allow web URLs.
 * Empty strings resolve to the page itself, so they pass (and stay empty).
 */
export function isSafeUrl(value: unknown, protocols: readonly string[] = ['http:', 'https:']): value is string {
  if (typeof value !== 'string') return false;
  try {
    // Relative URLs resolve against the page, so they're kept.
    return protocols.includes(new URL(value, globalThis.location?.href ?? 'https://localhost/').protocol);
  } catch {
    return false;
  }
}

/** Return the URL if it's safe (see `isSafeUrl`), otherwise an empty string. */
export function safeUrl(value: unknown, protocols?: readonly string[]): string {
  return isSafeUrl(value, protocols) ? value : '';
}
