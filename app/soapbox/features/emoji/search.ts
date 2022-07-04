export interface searchOptions {
  maxResults?: number;
}

export interface Emoji {

}

export const addCustomToPool = (customEmojis: Emoji[]) => {
};

const search = (str: string, options: searchOptions) => {
  console.log(str, options);
  return [];
};

export default search;
