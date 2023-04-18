// Adapted from: https://github.com/facebook/lexical/issues/2715#issuecomment-1209090485

import {
  BOLD_ITALIC_UNDERSCORE,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  STRIKETHROUGH,
  INLINE_CODE,
  HEADING,
  QUOTE,
  ORDERED_LIST,
  UNORDERED_LIST,
  LINK,
  TextMatchTransformer,
} from '@lexical/markdown';

const replaceEscapedChars = (text: string): string => {
  // convert "\*" to "*", "\_" to "_", "\~" to "~", ...
  return text
    .replaceAll('\\*', '*')
    .replaceAll('\\_', '_')
    .replaceAll('\\-', '-')
    .replaceAll('\\#', '#')
    .replaceAll('\\>', '>')
    .replaceAll('\\+', '+')
    .replaceAll('\\~', '~');
};

const replaceUnescapedChars = (text: string, regexes: RegExp[]): string => {
  // convert "*" to "", "_" to "", "~" to "" (all chars, which are not escaped - means with "\" in front)
  for (const regex of regexes) {
    text = text.replaceAll(regex, '');
  }
  return text;
};

const UNESCAPE_ITALIC_UNDERSCORE_IMPORT_REGEX =
  /([\_])(?<!(?:\1|\w).)(?![_*\s])(.*?[^_*\s])(?=\1)([\_])(?!\w|\3)/;
const UNESCAPE_ITALIC_UNDERSCORE_REGEX =
  /([\_])(?<!(?:\1|\w).)(?![_*\s])(.*?[^_*\s])(?=\1)([\_])(?!\w|\3)/;

export const UNESCAPE_ITALIC_UNDERSCORE: TextMatchTransformer = {
  dependencies: [],
  export: () => null,
  importRegExp: UNESCAPE_ITALIC_UNDERSCORE_IMPORT_REGEX,
  regExp: UNESCAPE_ITALIC_UNDERSCORE_REGEX,
  replace: (textNode, _) => {
    const notEscapedUnderscoreRegex = /(?<![\\]{1})[\_]{1}/g;
    const textContent = replaceUnescapedChars(textNode.getTextContent(), [
      notEscapedUnderscoreRegex,
    ]);
    textNode.setTextContent(replaceEscapedChars(textContent));
    textNode.setFormat('italic');
  },
  trigger: '_',
  type: 'text-match',
};

const UNESCAPE_BACKSLASH_IMPORT_REGEX = /(\\(?:\\\\)?).*?\1*[\~\*\_\{\}\[\]\(\)\#\+\-\.\!]/;
const UNESCAPE_BACKSLASH_REGEX = /(\\(?:\\\\)?).*?\1*[\~\*\_\{\}\[\]\(\)\#\+\-\.\!]$/;

export const UNESCAPE_BACKSLASH: TextMatchTransformer = {
  dependencies: [],
  export: () => null,
  importRegExp: UNESCAPE_BACKSLASH_IMPORT_REGEX,
  regExp: UNESCAPE_BACKSLASH_REGEX,
  replace: (textNode, _) => {
    if (textNode) {
      textNode.setTextContent(replaceEscapedChars(textNode.getTextContent()));
    }
  },
  trigger: '\\',
  type: 'text-match',
};

export const TO_WYSIWYG_TRANSFORMERS = [
  UNESCAPE_BACKSLASH,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_ITALIC_STAR,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  STRIKETHROUGH,
  UNESCAPE_ITALIC_UNDERSCORE,
  // UNESCAPE_ITALIC_STAR,
  INLINE_CODE,
  HEADING,
  QUOTE,
  ORDERED_LIST,
  UNORDERED_LIST,
  LINK,
];
