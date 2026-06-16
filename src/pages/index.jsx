import Head from 'next/head';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Sidebar        from '../components/Sidebar';
import AssetOverview  from '../components/AssetOverview';
import CommandCenter  from '../components/CommandCenter';
import TransferModule from '../components/TransferModule';
import ArcStreamEngine from '../components/ArcStreamEngine'; // नया फीचर ऐड
import { useWallet }  from '../hooks/useWallet';
import { useLiveData } from '../hooks/useLiveData';
import { shortAddr }  from '../lib/arc';

const LANGS = ['en', 'hi', 'es', 'zh'];

// ── Network pill ──────────────────────────────────────────────────────────────
function NetPill({ label, ok }) {
  return (
    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-zinc-600">
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: ok ? '#00c896' : '#f59e0b', boxShadow: ok ? '0 0 4px #00c896' : '0 0 4px #f59e0b' }}
      />
      {label}
    </div>
  );
}

// ── Header (वही है, कोई बदलाव नहीं) ──────────────────────────────────────────
function Header({ address, isArc, txps, connect, disconnect, switchToArc, connecting }) {
  const { t, i18n } = useTranslation('common');
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md h-13 flex items-center px-4 sm:px-6 gap-4">
      <div className="flex md:hidden items-center gap-2 shrink-0">
        <span className="font-bold text-sm text-white tracking-tight">arcanvas</span>
      </div>
      <div className="flex items-center gap-3"><NetPill label="Arc Testnet" ok={isArc} /></div>
      <div className="flex-1" />
      <button onClick={connect} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs">Connect</button>
    </header>
  );
}

// ── Root page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeView, setActiveView] = useState('overview');
  const wallet   = useWallet();
  const liveData = useLiveData();

  return (
    <div className="flex h-screen overflow-hidden bg-bg text-zinc-100">
      <Sidebar active={activeView} setActive={setActiveView} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-5 max-w-6xl mx-auto">
          
          {/* नया फीचर - यहाँ से एक्टिव हो गया */}
          <section className="mb-8">
            <ArcStreamEngine />
          </section>

          {activeView === 'overview' && (
            <AssetOverview balances={wallet.balances} address={wallet.address} tick={liveData.tick} />
          )}

          {activeView === 'transfer' && (
            <TransferModule signer={wallet.signer} address={wallet.address} />
          )}

          {['pipeline','treasury'].includes(activeView) && (
            <CommandCenter focusSection={activeView} />
          )}
        </div>
      </main>
    </div>
  );
}
