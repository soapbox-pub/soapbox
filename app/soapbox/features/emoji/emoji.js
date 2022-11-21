import Trie from 'substring-trie';

import { joinPublicPath } from 'soapbox/utils/static';

import unicodeMapping from './emoji-unicode-mapping-light';

const trie = new Trie(Object.keys(unicodeMapping));

const emojifyTextNode = (node, customEmojis, autoPlayGif = false) => {
  let str = node.textContent;

  const fragment = new DocumentFragment();

  for (;;) {
    let match, i = 0;

    if (customEmojis === null) {
      while (i < str.length && !(match = trie.search(str.slice(i)))) {
        i += str.codePointAt(i) < 65536 ? 1 : 2;
      }
    } else {
      while (i < str.length && str[i] !== ':' && !(match = trie.search(str.slice(i)))) {
        i += str.codePointAt(i) < 65536 ? 1 : 2;
      }
    }

    let rend, replacement = null;
    if (i === str.length) {
      break;
    } else if (str[i] === ':') {
      // eslint-disable-next-line no-loop-func
      if (!(() => {
        rend = str.indexOf(':', i + 1) + 1;
        if (!rend) return false; // no pair of ':'
        const shortname = str.slice(i, rend);
        // now got a replacee as ':shortname:'
        // if you want additional emoji handler, add statements below which set replacement and return true.
        if (shortname in customEmojis) {
          const filename = autoPlayGif ? customEmojis[shortname].url : customEmojis[shortname].static_url;
          replacement = document.createElement('img');
          replacement.setAttribute('draggable', false);
          replacement.setAttribute('class', 'emojione custom-emoji');
          replacement.setAttribute('alt', shortname);
          replacement.setAttribute('title', shortname);
          replacement.setAttribute('src', filename);
          replacement.setAttribute('data-original', customEmojis[shortname].url);
          replacement.setAttribute('data-static', customEmojis[shortname].static_url);
          return true;
        }
        return false;
      })()) rend = ++i;
    } else { // matched to unicode emoji
      const { filename, shortCode } = unicodeMapping[match];
      const title = shortCode ? `:${shortCode}:` : '';
      replacement = document.createElement('img');
      replacement.setAttribute('draggable', false);
      replacement.setAttribute('class', 'emojione');
      replacement.setAttribute('alt', match);
      replacement.setAttribute('title', title);
      replacement.setAttribute('src', joinPublicPath(`packs/emoji/${filename}.svg`));
      rend = i + match.length;
      // If the matched character was followed by VS15 (for selecting text presentation), skip it.
      if (str.codePointAt(rend) === 65038) {
        rend += 1;
      }
    }

    fragment.append(document.createTextNode(str.slice(0, i)));
    if (replacement) {
      fragment.append(replacement);
    }
    node.textContent = str.slice(0, i);
    str = str.slice(rend);
  }

  fragment.append(document.createTextNode(str));
  node.parentElement.replaceChild(fragment, node);
};

const emojifyNode = (node, customEmojis, autoPlayGif = false) => {
  for (const child of node.childNodes) {
    switch (child.nodeType) {
      case Node.TEXT_NODE:
        emojifyTextNode(child, customEmojis, autoPlayGif);
        break;
      case Node.ELEMENT_NODE:
        if (!child.classList.contains('invisible'))
          emojifyNode(child, customEmojis, autoPlayGif);
        break;
    }
  }
};

const emojify = (str, customEmojis = {}, autoPlayGif = false) => {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = str;

  if (!Object.keys(customEmojis).length)
    customEmojis = null;

  emojifyNode(wrapper, customEmojis, autoPlayGif);

  return wrapper.innerHTML;
};

export default emojify;

export const buildCustomEmojis = (customEmojis, autoPlayGif = false) => {
  const emojis = [];

  customEmojis.forEach(emoji => {
    const shortcode = emoji.get('shortcode');
    const url       = autoPlayGif ? emoji.get('url') : emoji.get('static_url');
    const name      = shortcode.replace(':', '');

    emojis.push({
      id: name,
      name,
      short_names: [name],
      text: '',
      emoticons: [],
      keywords: [name],
      imageUrl: url,
      custom: true,
      customCategory: emoji.get('category'),
    });
  });

  return emojis;
};

export const categoriesFromEmojis = customEmojis => customEmojis.reduce((set, emoji) => set.add(emoji.get('category') ? `custom-${emoji.get('category')}` : 'custom'), new Set(['custom']));