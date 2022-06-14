/**
 * Detect whether a message contains valid PGP headers.
 * @see {@link https://datatracker.ietf.org/doc/html/rfc4880#section-7}
 */
const isPgpMessage = (message: string): boolean => {
  return /^-----BEGIN PGP [A-Z ]+-----/.test(message);
};

export {
  isPgpMessage,
};
