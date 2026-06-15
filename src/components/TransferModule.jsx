import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import { fmt, shortAddr, txUrl } from '../lib/arc';
import { estimateFee, sendArc, sendUsdc } from '../lib/transfer';

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

function TxSuccess({ result }) {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);
  return (
    <div className="slide-in rounded-xl border border-green/40 bg-green/5 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-green text-sm font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="m6 10 3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {t('success')}
      </div>
      <div className="flex flex-col gap-1.5 text-xs">
        {[
          [t('txHash'), shortAddr(result.txHash)],
          [t('block'),  result.blockNumber],
          [t('gasUsed'), Number(result.gasUsed).toLocaleString()],
        ].map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <span className="text-zinc-500 w-16 shrink-0">{k}</span>
            <span className="font-mono text-zinc-300">{v}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <a href={result.arcScanUrl} target="_blank" rel="noopener noreferrer"
          className="text-xs text-cyan hover:text-sky-300 transition flex items-center gap-1">
          {t('verify')}
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
            <path d="M2 2h8v8M10 2 2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </a>
        <button onClick={() => { navigator.clipboard.writeText(result.txHash); setCopied(true); }}
          className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-mono transition">
          {copied ? '✓ copied' : 'copy hash'}
        </button>
      </div>
    </div>
  );
}

function AiPanel() {
  const { t } = useTranslation('common');
  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [msgs, setMsgs]       = useState([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  async function ask() {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMsgs(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...msgs, userMsg] }),
      });
      const data = await res.json();
      setMsgs(m => [...m, { role: 'assistant', content: data.content || data.error || 'No response' }]);
    } catch (e) {
      setMsgs(m => [...m, { role: 'assistant', content: e.message }]);
    }
    setLoading(false);
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-400 hover:text-zinc-200 transition bg-surface">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple" />
          {t('ask')}
        </span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 16 16" fill="none">
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="border-t border-border bg-bg p-3 flex flex-col gap-3">
          <div className="max-h-44 overflow-y-auto flex flex-col gap-2 text-xs">
            {msgs.length === 0 && (
              <p className="text-zinc-600 text-center py-3">{t('aiPlaceholder')}</p>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={`px-3 py-2 rounded-lg leading-relaxed ${
                m.role === 'user'
                  ? 'bg-sky-950/40 border border-sky-900/30 text-sky-200 ml-6'
                  : 'bg-zinc-800/60 border border-zinc-700/30 text-zinc-300 mr-6'
              }`}>{m.content}</div>
            ))}
            {loading && <div className="flex justify-center py-2"><Spinner /></div>}
            <div ref={endRef} />
          </div>
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && ask()}
              placeholder={t('aiPlaceholder')}
              className="flex-1 bg-zinc-800 border border-border rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-purple transition" />
            <button onClick={ask} disabled={loading || !input.trim()}
              className="px-3 py-2 rounded-lg bg-purple/80 hover:bg-purple disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-xs font-medium transition flex items-center gap-1">
              {loading ? <Spinner /> : 'ask'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransferModule({ signer, provider, address, isArc, balances, onSuccess }) {
  const { t } = useTranslation('common');
  const [asset,     setAsset]     = useState('ARC');
  const [recipient, setRecipient] = useState('');
  const [amount,    setAmount]    = useState('');
  const [feeInfo,   setFeeInfo]   = useState(null);
  const [feeLoad,   setFeeLoad]   = useState(false);
  const [sending,   setSending]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState('');
  const [history,   setHistory]   = useState([]);
  const feeTimer = useRef(null);

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
    setError(''); setResult(null);
    if (!ethers.isAddress(recipient)) return setError('Invalid recipient address');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return setError('Enter a valid amount');
    const fee = parseFloat(feeInfo?.feeEth || '0');
    if (asset === 'ARC' && amt + fee > parseFloat(balances.eth)) return setError(t('insufficient'));
    if (asset === 'USDC' && (amt > parseFloat(balances.usdc) || fee > parseFloat(balances.eth)))
      return setError(t('insufficient'));
    setSending(true);
    try {
      const res = asset === 'ARC'
        ? await sendArc(signer, recipient, amount)
        : await sendUsdc(signer, recipient, amount, balances.usdcDecimals);
      setResult(res);
      setHistory(h => [{ ...res, asset, amount, recipient, ts: Date.now() }, ...h].slice(0, 20));
      setAmount(''); setRecipient(''); setFeeInfo(null);
      onSuccess?.();
    } catch (e) {
      setError(e.reason || e.message || 'Transaction failed');
    }
    setSending(false);
  }

  function setMax() {
    setAmount(asset === 'ARC'
      ? fmt(Math.max(0, parseFloat(balances.eth) - 0.001), 8)
      : fmt(balances.usdc, 6)
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* asset toggle */}
      <div className="flex gap-1 p-1 rounded-xl bg-zinc-800/60">
        {['ARC', 'USDC'].map(a => (
          <button key={a} onClick={() => { setAsset(a); setFeeInfo(null); setAmount(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              asset === a ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
            }`}>{a}</button>
        ))}
      </div>

      {/* recipient */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-zinc-500 font-medium">{t('recipient')}</label>
        <input value={recipient} onChange={e => setRecipient(e.target.value)}
          placeholder="0x…" spellCheck={false}
          className="w-full bg-zinc-800 border border-border rounded-xl px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan transition" />
      </div>

      {/* amount */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500 font-medium">{t('amount')}</label>
          <button onClick={setMax}
            className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition font-mono">
            max
          </button>
        </div>
        <div className="relative">
          <input value={amount} onChange={e => setAmount(e.target.value)}
            type="number" min="0" step="any" placeholder="0.00"
            className="w-full bg-zinc-800 border border-border rounded-xl px-3 py-2.5 text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan transition pr-16" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">{asset}</span>
        </div>
      </div>

      {/* fee estimate */}
      {(feeInfo || feeLoad) && (
        <div className="rounded-xl bg-zinc-800/60 p-3 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-zinc-500">{t('estFee')}</span>
            <span className="font-mono text-zinc-300 flex items-center gap-1">
              {feeLoad ? <Spinner /> : `${fmt(feeInfo?.feeEth, 8)} ARC`}
            </span>
          </div>
          {amount && (
            <div className="flex justify-between">
              <span className="text-zinc-500">{t('receiverGets')}</span>
              <span className="font-mono text-green">{fmt(parseFloat(amount), asset === 'ARC' ? 8 : 6)} {asset}</span>
            </div>
          )}
          <div className="text-zinc-600 text-[10px]">{t('feeNote')}</div>
        </div>
      )}

      {error && (
        <div className="text-xs text-danger bg-red-950/30 border border-danger/30 rounded-xl px-3 py-2">{error}</div>
      )}

      <button onClick={send} disabled={sending || !isArc || !amount || !recipient || !signer}
        className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold text-sm transition flex items-center justify-center gap-2">
        {sending && <Spinner />}
        {!signer ? 'Connect wallet first' : sending ? t('sending') : t('confirm')}
      </button>

      {result && <TxSuccess result={result} />}

      <AiPanel />

      {/* history */}
      {history.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">{t('history')}</div>
          {history.map((tx, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-3 flex flex-col gap-1 text-xs slide-in">
              <div className="flex items-center justify-between">
                <span className="font-mono text-zinc-400">{fmt(tx.amount)} {tx.asset} → {shortAddr(tx.recipient)}</span>
                <span className="text-zinc-600">{new Date(tx.ts).toLocaleTimeString()}</span>
              </div>
              <a href={tx.arcScanUrl} target="_blank" rel="noopener noreferrer"
                className="font-mono text-cyan hover:text-sky-300 truncate transition text-[11px]">
                {shortAddr(tx.txHash)} ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
