import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, localhost } from 'wagmi/chains'; // localhost या custom chain जोड़ें
import { publicProvider } from 'wagmi/providers/public';

// अगर 'Arc Testnet' की अपनी चेन आईडी है, तो उसे यहाँ जोड़ें
const arcTestnet = {
  id: 12345, // यहाँ अपनी चेन आईडी डालें
  name: 'Arc Testnet',
  network: 'arc',
  nativeCurrency: { name: 'Arc', symbol: 'ARC', decimals: 18 },
  rpcUrls: { default: { http: ['YOUR_RPC_URL'] } }, // अपना RPC URL डालें
};

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, arcTestnet],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Arcanvas',
  projectId: 'YOUR_PROJECT_ID', 
  chains
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

export { chains };
