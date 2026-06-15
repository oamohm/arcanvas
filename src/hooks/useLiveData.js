import { useState, useEffect, useRef } from 'react';

function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max)); }

const LOG_POOL = [
  { level: 'info',  msg: 'Settlement batch confirmed — 0 reverts',          chain: 'Arc' },
  { level: 'ok',    msg: 'Multisig 3/5 reached — disbursement released',    chain: 'Arc' },
  { level: 'warn',  msg: 'Gas spike on ETH L1 — routing via L2 bridge',    chain: 'ETH' },
  { level: 'info',  msg: 'AI agent re-scored compliance threshold: 98.1',   chain: 'Arc' },
  { level: 'error', msg: 'Liquidity rebalance failed — slippage >0.8%',     chain: 'ARB' },
  { level: 'ok',    msg: 'Governance proposal #19 executed on-chain',       chain: 'Arc' },
  { level: 'info',  msg: 'Cross-chain bridge finalised — 84k USDC settled', chain: 'OP'  },
  { level: 'ok',    msg: 'KYC/AML screen passed — 4 entities cleared',     chain: 'Arc' },
  { level: 'warn',  msg: 'Mempool congestion — retry queued',               chain: 'ETH' },
  { level: 'info',  msg: 'Agent AGT-02 processed 31 routing tasks',        chain: 'Arc' },
];

export function useLiveData() {
  const [tick,     setTick]     = useState(0);
  const [velData,  setVelData]  = useState(() => Array.from({length: 24}, () => randInt(15, 90)));
  const [usdcFlow, setUsdcFlow] = useState(() => Array.from({length: 20}, () => randInt(40000, 120000)));
  const [txps,     setTxps]     = useState(14);
  const [treasury, setTreasury] = useState(4_820_400);
  const [logs,     setLogs]     = useState(() =>
    LOG_POOL.slice(0, 7).map((l, i) => ({
      ...l, id: i,
      ts: `02:${String(14 - i).padStart(2,'0')}:${String(randInt(0,59)).padStart(2,'0')}`,
    }))
  );

  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTick(t => t + 1);
      setVelData(d => [...d.slice(1), randInt(10, 100)]);
      setUsdcFlow(d => [...d.slice(1), randInt(35000, 140000)]);
      setTxps(randInt(8, 30));
      setTreasury(v => Math.max(0, v + randInt(-400, 1200)));

      if (Math.random() > 0.6) {
        const entry = LOG_POOL[randInt(0, LOG_POOL.length)];
        const now = new Date();
        const ts = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
        setLogs(prev => [{ ...entry, id: Date.now(), ts }, ...prev].slice(0, 50));
      }
    }, 1800);
    return () => clearInterval(timerRef.current);
  }, []);

  return { tick, velData, usdcFlow, txps, treasury, logs };
}
