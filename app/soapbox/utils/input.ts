/** Trim the username and strip the leading @. */
const normalizeUsername = (username: string): string => {
  const trimmed = username.trim();
  if (trimmed[0] === '@') {
    return trimmed.slice(1);
  } else {
    return trimmed;
  }
};

export {
  normalizeUsername,
};