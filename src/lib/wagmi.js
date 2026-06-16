import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';

// Arc Testnet कॉन्फ़िगरेशन
const arcTestnet = {
  id: 11155111,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.sepolia.org'] },
  },
};

const { chains, publicClient } = configureChains(
  [arcTestnet, mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Arcanvas',
  projectId: 'a5e9f8c6b3d2e1f4a9b8c7d6e5f4a3b2',
  chains
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
});

// बैलेंस फॉर्मेटिंग फंक्शन (इसे आप अपने कॉम्पोनेंट में इम्पोर्ट कर सकते हैं)
export const formatBalance = (balance) => {
  if (!balance) return "0.00";
  return Number(balance / 10n**18n).toFixed(2);
};

export { chains };
