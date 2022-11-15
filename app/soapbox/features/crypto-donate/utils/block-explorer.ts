import blockExplorers from './block-explorers.json';

type BlockExplorers = Record<string, string | null>;

export const getExplorerUrl = (ticker: string, address: string): string | null => {
  const template = (blockExplorers as BlockExplorers)[ticker];
  if (!template) return null;
  return template.replace('{address}', address);
};
