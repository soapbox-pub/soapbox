// @preval
// http://www.unicode.org/Public/emoji/5.0/emoji-test.txt
// This file contains the compressed version of the emoji data from
// both emoji-map.json and from emoji-mart's emojiIndex and data objects.
// It's designed to be emitted in an array format to take up less space
// over the wire.

const { emojiIndex } = require('emoji-mart-lazyload');
let data = require('emoji-mart-lazyload/data/all.json');
const { uncompress: emojiMartUncompress } = require('emoji-mart-lazyload/dist/utils/data');

const emojiMap = require('./emoji-map.json');
const { unicodeToFilename } = require('./unicode-to-filename');
const { unicodeToUnifiedName } = require('./unicode-to-unified-name');

if (data.compressed) {
  data = emojiMartUncompress(data);
}

const emojiMartData = data;

const excluded       = ['®', '©', '™'];
const skinTones      = ['🏻', '🏼', '🏽', '🏾', '🏿'];
const shortcodeMap   = {};

const shortCodesToEmojiData = {};
const emojisWithoutShortCodes = [];

Object.keys(emojiIndex.emojis).forEach(key => {
  let emoji = emojiIndex.emojis[key];

  // Emojis with skin tone modifiers are stored like this
  if (Object.prototype.hasOwnProperty.call(emoji, '1')) {
    emoji = emoji['1'];
  }

  shortcodeMap[emoji.native] = emoji.id;
});

const stripModifiers = unicode => {
  skinTones.forEach(tone => {
    unicode = unicode.replace(tone, '');
  });

  return unicode;
};

Object.keys(emojiMap).forEach(key => {
  if (excluded.includes(key)) {
    delete emojiMap[key];
    return;
  }

  const normalizedKey = stripModifiers(key);
  let shortcode       = shortcodeMap[normalizedKey];

  if (!shortcode) {
    shortcode = shortcodeMap[normalizedKey + '\uFE0F'];
  }

  const filename = emojiMap[key];

  const filenameData = [key];

  if (unicodeToFilename(key) !== filename) {
    // filename can't be derived using unicodeToFilename
    filenameData.push(filename);
  }

  if (typeof shortcode === 'undefined') {
    emojisWithoutShortCodes.push(filenameData);
  } else {
    if (!Array.isArray(shortCodesToEmojiData[shortcode])) {
      shortCodesToEmojiData[shortcode] = [[]];
    }

    shortCodesToEmojiData[shortcode][0].push(filenameData);
  }
});

Object.keys(emojiIndex.emojis).forEach(key => {
  let emoji = emojiIndex.emojis[key];

  // Emojis with skin tone modifiers are stored like this
  if (Object.prototype.hasOwnProperty.call(emoji, '1')) {
    emoji = emoji['1'];
  }

  const { native } = emoji;
  const { short_names, search, unified } = emojiMartData.emojis[key];

  if (short_names[0] !== key) {
    throw new Error('The compresser expects the first short_code to be the ' +
      'key. It may need to be rewritten if the emoji change such that this ' +
      'is no longer the case.');
  }

  const searchData = [
    native,
    short_names.slice(1), // first short name can be inferred from the key
    search,
  ];

  if (unicodeToUnifiedName(native) !== unified) {
    // unified name can't be derived from unicodeToUnifiedName
    searchData.push(unified);
  }

  if (!Array.isArray(shortCodesToEmojiData[key])) {
    shortCodesToEmojiData[key] = [[]];
  }

  shortCodesToEmojiData[key].push(searchData);
});

// JSON.parse/stringify is to emulate what @preval is doing and avoid any
// inconsistent behavior in dev mode
module.exports = JSON.parse(JSON.stringify([
  shortCodesToEmojiData,
  emojiMartData.skins,
  emojiMartData.categories,
  emojiMartData.aliases,
  emojisWithoutShortCodes,
]));
