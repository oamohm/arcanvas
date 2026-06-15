'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { ARC_CHAIN_ID, ARC_CHAIN_PARAMS, shortAddr, txUrl } from '../lib/arc';
import { fetchBalances, estimateFee, sendArc, sendUsdc } from '../lib/transfer';
import '../lib/i18n';

const LANGS = ['en', 'hi', 'es', 'zh'];

function cls(...a) { return a.filter(Boolean).join(' '); }
function fmt(n, d = 6) {
  const v = parseFloat(n);
  return isNaN(v) ? '0' : v.toFixed(d).replace(/\.?0+$/, '') || '0';
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
    </svg>
  );
}

function TxResult({ result, t }) {
  const [copied, setCopied] = useState(false);
  function copy() { navigator.clipboard.writeText(result.txHash); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return (
    <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/20 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
          <path d="m6 10 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {t('success')}
      </div>
      <div className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 w-16 shrink-0">{t('txHash')}</span>
          <span className="font-mono text-zinc-300 truncate">{shortAddr(result.txHash)}</span>
          <button onClick={copy} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition shrink-0">
            {copied ? '✓' : 'copy'}
          </button>
        </div>
        <div className="flex gap-2">
          <span className="text-zinc-500 w-16 shrink-0">{t('block')}</span>
          <span className="font-mono text-zinc-300">{result.blockNumber}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-zinc-500 w-16 shrink-0">{t('gasUsed')}</span>
          <span className="font-mono text-zinc-300">{Number(result.gasUsed).toLocaleString()}</span>
        </div>
      </div>
      <a href={result.arcScanUrl} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sky-400 hover:text-sky-300 text-xs font-medium transition">
        {t('verify')}
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
          <path d="M2 2h8v8M10 2 2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </a>
    </div>
  );
}

function AiAssistant({ t }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function ask() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: 'assistant', content: data.content || data.error }]);
    } catch (e) {
      setMessages(m => [...m, { role: 'assistant', content: e.message }]);
    }
    setLoading(false);
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-400 hover:text-zinc-200 transition">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_6px_#a259ff]"/>
          {t('ask')}
        </span>
        <svg className={cls("w-4 h-4 transition-transform", open && "rotate-180")} viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div className="border-t border-zinc-800 p-3 flex flex-col gap-3">
          <div className="max-h-48 overflow-y-auto flex flex-col gap-2 text-xs">
            {messages.length === 0 && (
              <p className="text-zinc-600 text-center py-4">{t('aiPlaceholder')}</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={cls("px-3 py-2 rounded-lg leading-relaxed",
                m.role === 'user'
                  ? "bg-sky-950/40 border border-sky-900/40 text-sky-200 ml-4"
                  : "bg-zinc-800/60 border border-zinc-700/40 text-zinc-300 mr-4"
              )}>
                {m.content}
              </div>
            ))}
            {loading && <div className="flex justify-center py-2"><Spinner/></div>}
            <div ref={bottomRef}/>
          </div>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask()}
              placeholder={t('aiPlaceholder')}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple-500 transition"
            />
            <button onClick={ask} disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-lg bg-purple-700 hover:bg-purple-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-medium transition flex items-center gap-1">
              {loading ? <Spinner/> : 'send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransferModule() {
  const { t, i18n } = useTranslation('common');
  const [provider, setProvider]   = useState(null);
  const [signer, setSigner]       = useState(null);
  const [address, setAddress]     = useState('');
  const [chainId, setChainId]     = useState(null);
  const [balances, setBalances]   = useState({ eth: '0', usdc: '0', usdcDecimals: 6 });
  const [balLoading, setBalLoad]  = useState(false);
  const [asset, setAsset]         = useState('ARC');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount]       = useState('');
  const [feeInfo, setFeeInfo]     = useState(null);
  const [feeLoad, setFeeLoad]     = useState(false);
  const [sending, setSending]     = useState(false);
  const [txResult, setTxResult]   = useState(null);
  const [txErr, setTxErr]         = useState('');
  const [walletErr, setWalletErr] = useState('');
  const [history, setHistory]     = useState([]);
  const feeTimer = useRef(null);

  const isArc = chainId === ARC_CHAIN_ID;

  async function refreshBal(p, addr) {
    setBalLoad(true);
    try { setBalances(await fetchBalances(p, addr)); } catch {}
    setBalLoad(false);
  }

  async function connect() {
    setWalletErr('');
    try {
      if (!window.ethereum) throw new Error('MetaMask not found');
      const p = new ethers.BrowserProvider(window.ethereum);
      await p.send('eth_requestAccounts', []);
      const s = await p.getSigner();
      const addr = await s.getAddress();
      const net = await p.getNetwork();
      setProvider(p); setSigner(s); setAddress(addr);
      setChainId(Number(net.chainId));
      await refreshBal(p, addr);
    } catch (e) { setWalletErr(e.message); }
  }

  async function switchNetwork() {
    try {
      await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [ARC_CHAIN_PARAMS] });
      await connect();
    } catch (e) { setWalletErr(e.message); }
  }

  function disconnectWallet() {
    setProvider(null); setSigner(null); setAddress('');
    setChainId(null); setBalances({ eth: '0', usdc: '0', usdcDecimals: 6 });
    setFeeInfo(null); setTxResult(null);
  }

  const doEstimate = useCallback(async () => {
    if (!provider || !address || !recipient || !amount || !isArc) return setFeeInfo(null);
    if (!ethers.isAddress(recipient) || parseFloat(amount) <= 0) return;
    setFeeLoad(true);
    try { setFeeInfo(await estimateFee(provider, address, recipient, amount, asset, balances.usdcDecimals)); }
    catch { setFeeInfo(null); }
    setFeeLoad(false);
  }, [provider, address, recipient, amount, asset, isArc, balances.usdcDecimals]);

  useEffect(() => {
    clearTimeout(feeTimer.current);
    feeTimer.current = setTimeout(doEstimate, 600);
    return () => clearTimeout(feeTimer.current);
  }, [doEstimate]);

  async function send() {
    setTxErr(''); setTxResult(null);
    if (!ethers.isAddress(recipient)) return setTxErr('Invalid recipient address');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setTxErr('Enter a valid amount');
    const fee = parseFloat(feeInfo?.feeEth || '0');
    if (asset === 'ARC' && amt + fee > parseFloat(balances.eth)) return setTxErr(t('insufficient'));
    if (asset === 'USDC') {
      if (amt > parseFloat(balances.usdc)) return setTxErr(t('insufficient'));
      if (fee > parseFloat(balances.eth)) return setTxErr(t('insufficient') + ' (ARC for gas)');
    }
    setSending(true);
    try {
      const result = asset === 'ARC'
        ? await sendArc(signer, recipient, amount)
        : await sendUsdc(signer, recipient, amount, balances.usdcDecimals);
      setTxResult(result);
      setHistory(h => [{ ...result, asset, amount, recipient, ts: Date.now() }, ...h].slice(0, 20));
      setAmount(''); setRecipient(''); setFeeInfo(null);
      await refreshBal(provider, address);
    } catch (e) { setTxErr(e.reason || e.message || 'Transaction failed'); }
    setSending(false);
  }

  function setMax() {
    if (asset === 'ARC') setAmount(fmt(Math.max(0, parseFloat(balances.eth) - 0.001), 8));
    else setAmount(fmt(balances.usdc, 6));
  }

  return (
    <div className="min-h-screen bg-[#080c14] text-zinc-100 font-sans antialiased">
      {/* nav */}
      <nav className="sticky top-0 z-20 border-b border-zinc-800/60 bg-[#080c14]/90 backdrop-blur-md px-4 sm:px-6 h-13 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 flex items-center justify-center">
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#00e5ff" strokeWidth="1.2"/>
              <circle cx="7" cy="7" r="2" fill="#00e5ff" opacity="0.8"/>
            </svg>
          </div>
          <span className="font-bold text-sm text-white tracking-tight">{t('appName')}</span>
        </div>
        <div className="flex items-center gap-2">
          {LANGS.map(l => (
            <button key={l} onClick={() => i18n.changeLanguage(l)}
              className={cls('px-1.5 py-0.5 rounded text-[10px] font-mono transition',
                i18n.language === l ? 'bg-zinc-700 text-white' : 'text-zinc-600 hover:text-zinc-300'
              )}>{l}</button>
          ))}
          {address ? (
            <div className="flex items-center gap-2 ml-1">
              <span className={cls('flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono border',
                isArc ? 'border-emerald-800/60 bg-emerald-950/40 text-emerald-400'
                      : 'border-amber-800/60 bg-amber-950/40 text-amber-400'
              )}>
                <span className={cls('w-1.5 h-1.5 rounded-full', isArc ? 'bg-emerald-400' : 'bg-amber-400')}/>
                {isArc ? shortAddr(address) : 'wrong net'}
              </span>
              <button onClick={disconnectWallet} className="text-[10px] text-zinc-600 hover:text-zinc-300 transition">{t('disconnect')}</button>
            </div>
          ) : (
            <button onClick={connect} className="ml-1 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition">
              {t('connect')}
            </button>
          )}
        </div>
      </nav>

      {/* banners */}
      {walletErr && <div className="px-4 py-2 bg-red-950/40 border-b border-red-800/40 text-xs text-red-400">{walletErr}</div>}
      {address && !isArc && (
        <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-800/40 flex items-center justify-between">
          <span className="text-xs text-amber-400">{t('wrongNetwork')}</span>
          <button onClick={switchNetwork} className="text-xs px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-500 text-white transition">Switch</button>
        </div>
      )}

      <main className="px-4 sm:px-6 py-6 max-w-md mx-auto flex flex-col gap-5">
        {!address ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-10 flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-purple-600/20 border border-zinc-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-400" fill="none" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M16 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill="currentColor"/>
                <path d="M2 10h20" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
            </div>
            <p className="text-sm text-zinc-500">Arc Testnet · USDC + ARC transfers</p>
            <button onClick={connect} className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition">
              {t('connect')}
            </button>
          </div>
        ) : (
          <>
            {/* balance card */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">{t('balance')}</span>
                {balLoading && <Spinner/>}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-mono font-bold text-white">{fmt(balances.eth, 6)} <span className="text-sm font-normal text-zinc-500">ARC</span></div>
                  <div className="text-lg font-mono font-semibold text-emerald-400 mt-1">{fmt(balances.usdc, 2)} <span className="text-xs font-normal text-zinc-500">USDC</span></div>
                </div>
                <a href={`${process.env.NEXT_PUBLIC_ARCSCAN || 'https://testnet.arcscan.app'}/address/${address}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-mono text-zinc-600 hover:text-zinc-300 transition">
                  {shortAddr(address)} ↗
                </a>
              </div>
            </div>

            {/* transfer form */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5 flex flex-col gap-4">
              {/* asset toggle */}
              <div className="flex gap-1 p-1 rounded-xl bg-zinc-800/60">
                {['ARC', 'USDC'].map(a => (
                  <button key={a} onClick={() => { setAsset(a); setFeeInfo(null); setAmount(''); }}
                    className={cls('flex-1 py-1.5 rounded-lg text-sm font-medium transition',
                      asset === a ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                    )}>{a}</button>
                ))}
              </div>

              {/* recipient */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-zinc-500 font-medium">{t('recipient')}</label>
                <input value={recipient} onChange={e => setRecipient(e.target.value)}
                  placeholder="0x…" spellCheck={false}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"/>
              </div>

              {/* amount */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-zinc-500 font-medium">{t('amount')}</label>
                  <button onClick={setMax} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition font-mono">max</button>
                </div>
                <div className="relative">
                  <input value={amount} onChange={e => setAmount(e.target.value)}
                    type="number" min="0" step="any" placeholder="0.00"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-sky-500 transition pr-16"/>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">{asset}</span>
                </div>
              </div>

              {/* fee */}
              {(feeInfo || feeLoad) && (
                <div className="rounded-xl bg-zinc-800/60 p-3 flex flex-col gap-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">{t('estFee')}</span>
                    <span className="font-mono text-zinc-300 flex items-center gap-1">
                      {feeLoad ? <Spinner/> : `${fmt(feeInfo?.feeEth, 8)} ARC`}
                    </span>
                  </div>
                  {amount && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">{t('receiverGets')}</span>
                      <span className="font-mono text-emerald-400">{fmt(parseFloat(amount), asset === 'ARC' ? 8 : 6)} {asset}</span>
                    </div>
                  )}
                  <div className="text-zinc-600 text-[10px]">{t('feeNote')}</div>
                </div>
              )}

              {txErr && <div className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-xl px-3 py-2">{txErr}</div>}

              <button onClick={send} disabled={sending || !isArc || !amount || !recipient}
                className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold text-sm transition flex items-center justify-center gap-2">
                {sending && <Spinner/>}
                {sending ? t('sending') : t('confirm')}
              </button>
            </div>

            {txResult && <TxResult result={txResult} t={t}/>}

            {/* ai assistant */}
            <AiAssistant t={t}/>

            {/* history */}
            {history.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">{t('history')}</div>
                {history.map((tx, i) => (
                  <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3 flex flex-col gap-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-zinc-400">{fmt(tx.amount)} {tx.asset} → {shortAddr(tx.recipient)}</span>
                      <span className="text-zinc-600">{new Date(tx.ts).toLocaleTimeString()}</span>
                    </div>
                    <a href={tx.arcScanUrl} target="_blank" rel="noopener noreferrer"
                      className="font-mono text-sky-400 hover:text-sky-300 truncate transition">
                      {shortAddr(tx.txHash)} ↗
                    </a>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
