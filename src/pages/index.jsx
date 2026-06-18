import Head from 'next/head';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from 'react-i18next';

// वॉलेट और इंटरैक्टिव कंपोनेंट्स को डायनामिक बनाया गया है (SSR: false)
const ConnectButton = dynamic(() => import('@rainbow-me/rainbowkit').then(m => m.ConnectButton), { ssr: false });
const Sidebar = dynamic(() => import('../components/Sidebar'), { ssr: false });
const AssetOverview = dynamic(() => import('../components/AssetOverview'), { ssr: false });
const CommandCenter = dynamic(() => import('../components/CommandCenter'), { ssr: false });
const TransferModule = dynamic(() => import('../components/TransferModule'), { ssr: false });
const ArcStreamEngine = dynamic(() => import('../components/ArcStreamEngine'), { ssr: false });

import { useWallet } from '../hooks/useWallet';
import { useLiveData } from '../hooks/useLiveData';

function NetPill({ label, ok }) {
  return (
    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-900 text-zinc-400">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-500'}`} />
      {label}
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6">
        <span className="font-bold text-white tracking-tight">arcanvas</span>
        <div className="flex items-center gap-3">
          <NetPill label="Arc Testnet" ok={true} />
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const [activeView, setActiveView] = useState('overview');
  const wallet = useWallet();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-zinc-100">
      <Sidebar active={activeView} setActive={setActiveView} />
      
      <main className="flex-1 overflow-y-auto">
        <Header />
        <div className="px-6 py-5 max-w-6xl mx-auto">
          <section>
            <ArcStreamEngine />
          </section>

          {activeView === 'overview' && (
            <AssetOverview balances={wallet.balances} address={wallet.address} />
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
