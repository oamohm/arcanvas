import Head from 'next/head';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Sidebar        from '../components/Sidebar';
import AssetOverview  from '../components/AssetOverview';
import CommandCenter  from '../components/CommandCenter';
import TransferModule from '../components/TransferModule';
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

// ── Header ────────────────────────────────────────────────────────────────────
function Header({ address, isArc, txps, connect, disconnect, switchToArc, connecting }) {
  const { t, i18n } = useTranslation('common');

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md h-13 flex items-center px-4 sm:px-6 gap-4">
      {/* brand — visible on mobile where sidebar is hidden */}
      <div className="flex md:hidden items-center gap-2 shrink-0">
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan/20 to-purple/20 border border-cyan/30 flex items-center justify-center">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#00e5ff" strokeWidth="1.2" />
            <circle cx="7" cy="7" r="2" fill="#00e5ff" opacity="0.8" />
          </svg>
        </div>
        <span className="font-bold text-sm text-white tracking-tight">arcanvas</span>
      </div>

      {/* network badges */}
      <div className="flex items-center gap-3 ml-0 md:ml-0">
        <NetPill label="Arc Testnet" ok={isArc} />
        <NetPill label="ETH L1"      ok={false} />
        <NetPill label="ARB"         ok={true}  />
        <NetPill label="OP"          ok={true}  />
      </div>

      {/* social badges */}
      <div className="hidden lg:flex items-center gap-2 border-l border-border pl-3">
        {[
          { href: 'https://github.com/oamohm/arcanvas', icon: 'GH', label: 'arcanvas' },
          { href: 'https://x.com',                      icon: 'X',  label: '@arcanvas' },
        ].map(s => (
          <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-surface text-zinc-500 hover:text-zinc-200 text-[10px] font-mono transition">
            <span className="font-bold">{s.icon}</span>
            {s.label}
            <span className="text-green text-[8px]">✓</span>
          </a>
        ))}
      </div>

      {/* spacer */}
      <div className="flex-1" />

      {/* tx velocity */}
      <div className="hidden sm:block text-right font-mono text-[10px] text-zinc-600">
        <div className="text-cyan">{txps} tx/s</div>
        <div>velocity</div>
      </div>

      {/* lang switcher */}
      <div className="flex gap-0.5">
        {LANGS.map(l => (
          <button key={l} onClick={() => i18n.changeLanguage(l)}
            className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition ${
              i18n.language === l ? 'bg-zinc-700 text-white' : 'text-zinc-600 hover:text-zinc-300'
            }`}>{l}</button>
        ))}
      </div>

      {/* wallet */}
      {address ? (
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono border ${
            isArc ? 'border-green/40 bg-green/5 text-green' : 'border-warn/40 bg-warn/5 text-warn'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isArc ? 'bg-green pulse-dot' : 'bg-warn'}`} />
            {isArc ? shortAddr(address) : 'wrong net'}
          </span>
          {!isArc && (
            <button onClick={switchToArc}
              className="text-[10px] px-2 py-1 rounded bg-warn/10 border border-warn/30 text-warn hover:bg-warn/20 transition font-mono">
              switch
            </button>
          )}
          <button onClick={disconnect}
            className="text-[10px] text-zinc-600 hover:text-zinc-300 transition font-mono">
            {t('disconnect')}
          </button>
        </div>
      ) : (
        <button onClick={connect} disabled={connecting}
          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-medium transition flex items-center gap-1.5">
          {connecting && (
            <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {t('connect')}
        </button>
      )}
    </header>
  );
}

// ── View label map ─────────────────────────────────────────────────────────────
const VIEW_TITLES = {
  overview:   'Asset Overview',
  transfer:   'Transfer',
  pipeline:   'Settlement Pipeline',
  treasury:   'USDC Treasury',
  liquidity:  'Cross-Chain Liquidity',
  compliance: 'Compliance & Audit',
  governance: 'Governance',
  agents:     'AI Agents',
};

// ── Root page ─────────────────────────────────────────────────────────────────
export default function Home() {
  const [activeView,      setActiveView]  = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const wallet   = useWallet();
  const liveData = useLiveData();

  // Mobile bottom nav views
  const MOBILE_NAV = ['overview', 'transfer', 'pipeline', 'logs'];

  return (
    <>
      <Head>
        <title>arcanvas — command center</title>
        <meta name="description" content="Arc testnet command center — USDC transfers, settlement pipeline, compliance, governance." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#080c14" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen overflow-hidden bg-bg text-zinc-100">
        {/* sidebar */}
        <Sidebar
          active={activeView}
          setActive={setActiveView}
          collapsed={sidebarCollapsed}
        />

        {/* main column */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* header */}
          <Header
            address={wallet.address}
            isArc={wallet.isArc}
            txps={liveData.txps}
            connect={wallet.connect}
            disconnect={wallet.disconnect}
            switchToArc={wallet.switchToArc}
            connecting={wallet.loading}
          />

          {/* wallet error banner */}
          {wallet.error && (
            <div className="px-4 sm:px-6 py-2 bg-red-950/40 border-b border-danger/30 text-xs text-red-400 shrink-0">
              {wallet.error}
            </div>
          )}

          {/* content */}
          <main className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-6 py-5 max-w-6xl mx-auto">

              {/* breadcrumb */}
              <div className="flex items-center gap-2 mb-4">
                <button onClick={() => setSidebarCollapsed(c => !c)}
                  className="hidden md:flex w-6 h-6 items-center justify-center rounded text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition">
                  <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                    <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="text-[10px] text-zinc-600 font-mono">arcanvas</span>
                <span className="text-[10px] text-zinc-700">/</span>
                <span className="text-[10px] text-zinc-400 font-mono">{VIEW_TITLES[activeView] || activeView}</span>
              </div>

              {/* ── views ── */}
              {activeView === 'overview' && (
                <AssetOverview
                  balances={wallet.balances}
                  address={wallet.address}
                  tick={liveData.tick}
                />
              )}

              {activeView === 'transfer' && (
                <div className="max-w-md">
                  {/* no-wallet prompt */}
                  {!wallet.address && (
                    <div className="rounded-2xl border border-dashed border-border p-10 flex flex-col items-center gap-4 text-center mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan/10 to-purple/10 border border-border flex items-center justify-center">
                        <svg className="w-6 h-6 text-cyan" fill="none" viewBox="0 0 24 24">
                          <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M16 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill="currentColor" />
                          <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <p className="text-sm text-zinc-500">connect wallet to send ARC or USDC</p>
                      <button onClick={wallet.connect}
                        className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition">
                        connect wallet
                      </button>
                    </div>
                  )}
                  <div className="bg-surface border border-border rounded-2xl p-5">
                    <TransferModule
                      signer={wallet.signer}
                      provider={wallet.provider}
                      address={wallet.address}
                      isArc={wallet.isArc}
                      balances={wallet.balances}
                      onSuccess={wallet.refreshBalances}
                    />
                  </div>
                </div>
              )}

              {/* all dashboard views route to CommandCenter with relevant section */}
              {['pipeline','treasury','liquidity','compliance','governance','agents','logs'].includes(activeView) && (
                <CommandCenter
                  tick={liveData.tick}
                  velData={liveData.velData}
                  usdcFlow={liveData.usdcFlow}
                  txps={liveData.txps}
                  treasury={liveData.treasury}
                  logs={liveData.logs}
                  focusSection={activeView}
                />
              )}

            </div>
          </main>

          {/* mobile bottom nav */}
          <nav className="md:hidden border-t border-border bg-surface flex shrink-0">
            {MOBILE_NAV.map(v => (
              <button key={v} onClick={() => setActiveView(v)}
                className={`flex-1 py-3 text-[10px] font-mono uppercase tracking-wider transition ${
                  activeView === v ? 'text-cyan' : 'text-zinc-600 hover:text-zinc-400'
                }`}>
                {v}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* footer — visible only when scrolled */}
      <style jsx global>{`
        .h-13 { height: 3.25rem; }
      `}</style>
    </>
  );
}
