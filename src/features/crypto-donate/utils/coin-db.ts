const coins: Record<string, string> = {
  aave: 'Aave',
  ada: 'Cardano',
  algo: 'Algorand',
  atom: 'Cosmos',
  avax: 'Avalanche',
  bch: 'Bitcoin Cash',
  btc: 'Bitcoin',
  dot: 'Polkadot',
  eos: 'EOS',
  etc: 'Ethereum Classic',
  eth: 'Ethereum',
  fil: 'Filecoin',
  icp: 'Internet Computer',
  link: 'Chainlink',
  ltc: 'Litecoin',
  matic: 'Polygon',
  sol: 'Solana',
  vet: 'VeChain',
  xlm: 'Stellar',
  xmr: 'Monero',
  xrp: 'Ripple',
  xtz: 'Tezos',
  zec: 'Zcash',
};

/** Get title from CoinDB based on ticker symbol */
export function getTitle(ticker: string): string {
  return coins[ticker] ?? '';
}
