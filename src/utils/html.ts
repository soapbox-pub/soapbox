/**
 * Parse untrusted HTML into an inert document.
 *
 * Never parse remote HTML with `document.createElement(...).innerHTML`: elements created
 * that way belong to the live page, so `<img onerror>` fires and resources load even
 * though they're never attached. A `DOMParser` document runs no scripts and loads nothing.
 */
export function parseHTML(html: string): HTMLElement {
  return new DOMParser().parseFromString(html, 'text/html').body;
}

/** Remove compatibility markup for features Soapbox supports. */
export function stripCompatibilityFeatures(html: string): string {
  const node = parseHTML(html);

  const selectors = [
    // Quote posting
    '.quote-inline',
    // Explicit mentions
    '.recipients-inline',
  ];

  // Remove all instances of all selectors
  selectors.forEach(selector => {
    node.querySelectorAll(selector).forEach(elem => {
      elem.remove();
    });
  });

  return node.innerHTML;
}

/** Convert HTML to plaintext, preserving line breaks between paragraphs and at `<br>`. */
export function htmlToPlaintext(html: string): string {
  const node = parseHTML(html);
  const doc = node.ownerDocument;

  node.querySelectorAll('br').forEach((br) => br.replaceWith(doc.createTextNode('\n')));
  node.querySelectorAll('p').forEach((p) => {
    if (p.nextElementSibling?.tagName === 'P') p.after(doc.createTextNode('\n\n'));
  });

  return node.textContent || '';
}
