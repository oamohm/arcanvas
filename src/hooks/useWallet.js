import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { ARC_CHAIN_ID, ARC_CHAIN_PARAMS } from '../lib/arc';
import { fetchBalances } from '../lib/transfer';

export function useWallet() {
  const [provider, setProvider] = useState(null);
  const [signer,   setSigner]   = useState(null);
  const [address,  setAddress]  = useState('');
  const [chainId,  setChainId]  = useState(null);
  const [balances, setBalances] = useState({ eth: '0', usdc: '0', usdcDecimals: 6 });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const isArc = chainId === ARC_CHAIN_ID;

  const connect = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      if (!window.ethereum) throw new Error('MetaMask not found — install it first');
      const p = new ethers.BrowserProvider(window.ethereum);
      await p.send('eth_requestAccounts', []);
      const s = await p.getSigner();
      const addr = await s.getAddress();
      const net  = await p.getNetwork();
      setProvider(p);
      setSigner(s);
      setAddress(addr);
      setChainId(Number(net.chainId));
      const bals = await fetchBalances(p, addr);
      setBalances(bals);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  }, []);

  const switchToArc = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [ARC_CHAIN_PARAMS],
      });
      await connect();
    } catch (e) {
      setError(e.message);
    }
  }, [connect]);

  const disconnect = useCallback(() => {
    setProvider(null); setSigner(null);
    setAddress(''); setChainId(null);
    setBalances({ eth: '0', usdc: '0', usdcDecimals: 6 });
    setError('');
  }, []);

  const refreshBalances = useCallback(async () => {
    if (!provider || !address) return;
    try {
      setBalances(await fetchBalances(provider, address));
    } catch {}
  }, [provider, address]);

  return {
    provider, signer, address, chainId, isArc,
    balances, loading, error,
    connect, disconnect, switchToArc, refreshBalances,
  };
}
