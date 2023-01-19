// A mapping of unicode strings to an object containing the filename
// (i.e. the svg filename) and a shortCode intended to be shown
// as a "title" attribute in an HTML element (aka tooltip).
import { unicodeToFilename } from './unicode-to-filename';

const [
  shortCodesToEmojiData,
  skins, // eslint-disable-line @typescript-eslint/no-unused-vars
  categories, // eslint-disable-line @typescript-eslint/no-unused-vars
  short_names, // eslint-disable-line @typescript-eslint/no-unused-vars
  emojisWithoutShortCodes,
] = import.meta.compileTime('./emoji-compressed.ts');

// decompress
const unicodeMapping = {};

function processEmojiMapData(emojiMapData, shortCode) {
  const [ native, filename ] = emojiMapData;

  unicodeMapping[native] = {
    shortCode,
    filename: filename || unicodeToFilename(native),
  };
}

Object.keys(shortCodesToEmojiData).forEach((shortCode) => {
  const [ filenameData ] = shortCodesToEmojiData[shortCode];
  filenameData.forEach(emojiMapData => processEmojiMapData(emojiMapData, shortCode));
});
emojisWithoutShortCodes.forEach(emojiMapData => processEmojiMapData(emojiMapData));

export default unicodeMapping;
