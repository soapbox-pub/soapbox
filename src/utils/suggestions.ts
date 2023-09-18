type CursorMatch = [
  tokenStart: number | null,
  token: string | null,
];

const textAtCursorMatchesToken = (
  str: string,
  caretPosition: number,
  searchTokens: string[],
): CursorMatch => {
  let word;

  const left = str.slice(0, caretPosition).search(/\S+$/);
  const right = str.slice(caretPosition).search(/\s/);

  if (right < 0) {
    word = str.slice(left);
  } else {
    word = str.slice(left, right + caretPosition);
  }

  if (!word || word.trim().length < 3 || !searchTokens.includes(word[0])) {
    return [null, null];
  }

  word = word.trim().toLowerCase();

  if (word.length > 0) {
    return [left + 1, word];
  } else {
    return [null, null];
  }
};

export { textAtCursorMatchesToken };