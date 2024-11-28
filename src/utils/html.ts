/** Remove compatibility markup for features Soapbox supports. */
export function stripCompatibilityFeatures(html: string): string {
  const node = document.createElement('div');
  node.innerHTML = html;

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

/** Convert HTML to plaintext. */
// https://stackoverflow.com/a/822486
export function htmlToPlaintext(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}
