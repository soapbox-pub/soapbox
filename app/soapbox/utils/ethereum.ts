import type { MetaMaskInpageProvider } from '@metamask/providers';

export const ethereum: () => MetaMaskInpageProvider | undefined = () => (window as any).ethereum;

export const hasEthereum = () => Boolean(ethereum());

// Requests an Ethereum wallet from the browser
// Returns a Promise containing the Ethereum wallet address (string).
export const getWallet: () => Promise<string> = () =>
  ethereum()!.request({ method: 'eth_requestAccounts' })
    .then((wallets) => (wallets as Array<string>)[0]);

// Asks the browser to sign a message with Ethereum.
// Returns a Promise containing the signature (string).
export const signMessage = (wallet: string, message: string) =>
  ethereum()!.request({ method: 'personal_sign', params: [message, wallet] });

// Combines the above functions.
// Returns an object with the `wallet` and `signature`
export const getWalletAndSign = (message: string) =>
  getWallet().then(wallet =>
    signMessage(wallet, message).then(signature => ({ wallet, signature })),
  );
