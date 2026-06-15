import { ethers } from 'ethers';

export const ARC_CHAIN_ID = Number(process.env.NEXT_PUBLIC_ARC_CHAIN_ID || 2222);
export const ARC_RPC      = process.env.NEXT_PUBLIC_ARC_RPC || 'https://rpc.testnet.arc.io';
export const ARCSCAN      = process.env.NEXT_PUBLIC_ARCSCAN || 'https://testnet.arcscan.app';
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || ethers.ZeroAddress;

export const ARC_CHAIN_PARAMS = {
  chainId: `0x${ARC_CHAIN_ID.toString(16)}`,
  chainName: 'Arc Testnet',
  nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
  rpcUrls: [ARC_RPC],
  blockExplorerUrls: [ARCSCAN],
};

export const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

export const txUrl   = hash => `${ARCSCAN}/tx/${hash}`;
export const addrUrl = addr => `${ARCSCAN}/address/${addr}`;

export function shortAddr(addr) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
