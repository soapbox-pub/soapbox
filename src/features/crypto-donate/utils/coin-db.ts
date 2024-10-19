const coins: Record<string, string> = {
  AAVE: 'Aave',
  ADA: 'Cardano',
  ALGO: 'Algorand',
  ATOM: 'Cosmos',
  AVAX: 'Avalanche',
  BCH: 'Bitcoin Cash',
  BTC: 'Bitcoin',
  DOT: 'Polkadot',
  EOS: 'EOS',
  ETC: 'Ethereum Classic',
  ETH: 'Ethereum',
  FIL: 'Filecoin',
  ICP: 'Internet Computer',
  LINK: 'Chainlink',
  LTC: 'Litecoin',
  MATIC: 'Polygon',
  SOL: 'Solana',
  VET: 'VeChain',
  XLM: 'Stellar',
  XMR: 'Monero',
  XRP: 'Ripple',
  XTZ: 'Tezos',
  ZEC: 'Zcash',
};

/** Get title from CoinDB based on ticker symbol */
export function getTitle(ticker: string): string {
  return coins[ticker] ?? '';
}
