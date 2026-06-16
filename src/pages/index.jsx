import Head from 'next/head';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectButton } from '@rainbow-me/rainbowkit'; // नया इम्पोर्ट

import Sidebar from '../components/Sidebar';
import AssetOverview from '../components/AssetOverview';
import CommandCenter from '../components/CommandCenter';
import TransferModule from '../components/TransferModule';
import ArcStreamEngine from '../components/ArcStreamEngine';
import { useWallet } from '../hooks/useWallet';
import { useLiveData } from '../hooks/useLiveData';
import { shortAddr } from '../lib/arc';

const LANGS = ['en', 'hi', 'es', 'zh'];

// Network pill
function NetPill({ label, ok }) {
  return (
    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-zinc-800">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {label}
    </div>
  );
}

// Header
function Header() {
  const { t } = useTranslation('common');
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md h-13 flex items-center justify-between px-6">
      <span className="font-bold text-white tracking-tight">arcanvas</span>
      <div className="flex items-center gap-3">
        <NetPill label="Arc Testnet" ok={true} />
        <ConnectButton /> 
      </div>
    </header>
  );
}

// Root page
export default function Home() {
  const [activeView, setActiveView] = useState('overview');
  const wallet = useWallet();
  const liveData = useLiveData();

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-zinc-100">
      <Sidebar active={activeView} setActive={setActiveView} />
      
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="px-6 py-5 max-w-6xl mx-auto">
          <section>
            <ArcStreamEngine />
          </section>

          {activeView === 'overview' && (
            <AssetOverview balances={wallet.balances} address={wallet.address} tick={liveData.tick} />
          )}

          {activeView === 'transfer' && (
            <TransferModule signer={wallet.signer} address={wallet.address} />
          )}

          {['pipeline', 'treasury'].includes(activeView) && (
            <CommandCenter focusSection={activeView} />
          )}
        </div>
      </main>
    </div>
  );
}
