import DOMPurify from 'isomorphic-dompurify';

/**
 * Tags allowed in HTML from the server, such as statuses, bios and chat messages.
 * Text formatting only: no forms, media players, SVG or MathML.
 */
const ALLOWED_TAGS = [
  'a', 'abbr', 'b', 'bdi', 'bdo', 'blockquote', 'br', 'code', 'del', 'em',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins', 'li', 'mark',
  'ol', 'p', 'pre', 'q', 'rp', 'rt', 'ruby', 's', 'small', 'span', 'strike',
  'strong', 'sub', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr',
  'u', 'ul',
];

/**
 * Attributes allowed on those tags.
 * `style` and `id` are left out, so content can't restyle or cover the page.
 */
const ALLOWED_ATTR = [
  'alt', 'class', 'colspan', 'dir', 'height', 'href', 'lang', 'rel', 'reversed',
  'rowspan', 'src', 'start', 'target', 'title', 'translate', 'value', 'width',
];

/**
 * Classes kept on content: the ones Mastodon and Pleroma use for mentions, hashtags
 * and link shortening, and microformats (`h-card`, `u-url`, ...).
 * Anything else (like a Tailwind `fixed inset-0`) could restyle the page.
 */
const ALLOWED_CLASSES = new Set(['mention', 'hashtag', 'ellipsis', 'invisible', 'quote-inline', 'recipients-inline']);
const MICROFORMAT_CLASS = /^(h|p|u|dt|e)-[a-z-]+$/;

/** A DOMPurify instance of our own, so its hooks don't affect other uses. */
const purify = DOMPurify(globalThis.window);

purify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName === 'class') {
    data.attrValue = data.attrValue
      .split(/\s+/)
      .filter((name) => ALLOWED_CLASSES.has(name) || MICROFORMAT_CLASS.test(name))
      .join(' ');

    if (!data.attrValue) {
      data.keepAttr = false;
    }
  }
});

/** Sanitize untrusted HTML from the server for rendering as rich text. */
export function sanitizeHtml(html: string): string {
  return purify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOW_ARIA_ATTR: false,
  });
}
