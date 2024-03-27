/** Trim the username and strip the leading @. */
const normalizeUsername = (username: string): string => {
  const trimmed = username.trim();
  if (trimmed[0] === '@') {
    return trimmed.slice(1);
  } else {
    return trimmed;
  }
};

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w]/g, '-') // replace non-word characters with a hyphen
    .replace(/-+/g, '-'); // replace multiple hyphens with a single hyphen
}

export {
  normalizeUsername,
  slugify,
};