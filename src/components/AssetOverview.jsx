import { useTranslation } from 'react-i18next';
import { fmt, addrUrl, shortAddr } from '../lib/arc';

// ── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data = [], color = '#00e5ff', w = 100, h = 32 }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  const gradId = `sg${color.replace('#', '')}`;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {(() => {
        const last = data[data.length - 1];
        return <circle cx={w} cy={h - ((last - min) / range) * h} r="2.5" fill={color} />;
      })()}
    </svg>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, delta, chart, color = '#00e5ff' }) {
  const up = delta?.startsWith('+');
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">{label}</div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-xl font-bold text-white font-mono tracking-tight leading-none">{value}</div>
          {sub && <div className="text-[10px] text-zinc-500 mt-1">{sub}</div>}
          {delta && (
            <div className={`text-xs font-mono mt-1 ${up ? 'text-green' : 'text-danger'}`}>
              {up ? '▲' : '▼'} {delta}
            </div>
          )}
        </div>
        {chart && <Sparkline data={chart} color={color} />}
      </div>
    </div>
  );
}

// ── Chain row ──────────────────────────────────────────────────────────────
const CHAINS = [
  { name: 'Arc',      tvl: '$12.4M', flow: '+$2.1M', apy: '4.2%', ok: true,  color: '#00e5ff' },
  { name: 'Ethereum', tvl: '$8.9M',  flow: '+$0.6M', apy: '3.1%', ok: false, color: '#a259ff' },
  { name: 'Arbitrum', tvl: '$5.3M',  flow: '+$1.8M', apy: '5.7%', ok: true,  color: '#00c896' },
  { name: 'Optimism', tvl: '$3.1M',  flow: '-$0.2M', apy: '4.9%', ok: true,  color: '#f59e0b' },
];

export default function AssetOverview({ balances, address, tick }) {
  const { t } = useTranslation('common');

  const ethChart  = Array.from({ length: 16 }, (_, i) => 4.8 + Math.sin(i * 0.7) * 0.3 + i * 0.01);
  const usdcChart = Array.from({ length: 16 }, () => 4.5 + Math.random() * 0.8);
  const tvlChart  = Array.from({ length: 16 }, (_, i) => 27 + i * 0.15 + Math.random() * 0.4);
  const compChart = Array.from({ length: 16 }, () => 94 + Math.random() * 5);

  return (
    <div className="flex flex-col gap-4">
      {/* stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label={`${t('balance')} — ARC`}
          value={`${fmt(balances.eth, 6)}`}
          sub="native token"
          delta={address ? '+live' : null}
          chart={ethChart}
          color="#00e5ff"
        />
        <StatCard
          label={`${t('balance')} — USDC`}
          value={fmt(balances.usdc, 2)}
          sub="arc testnet"
          chart={usdcChart}
          color="#00c896"
        />
        <StatCard
          label="Cross-chain TVL"
          value="$29.7M"
          sub="4 chains"
          delta="+$2.4M 24h"
          chart={tvlChart}
          color="#a259ff"
        />
        <StatCard
          label={t('compliance') + ' Score'}
          value="98.1"
          sub="AI-verified / 100"
          delta="+0.7 session"
          chart={compChart}
          color="#00c896"
        />
      </div>

      {/* cross-chain liquidity */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot" />
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">{t('allChains')} — {t('liquidity')}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {CHAINS.map(c => (
            <div key={c.name} className="bg-bg border border-border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />
                <span className="text-xs font-semibold text-zinc-200">{c.name}</span>
                <span className={`ml-auto text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  c.ok ? 'text-green border-green/30 bg-green/10' : 'text-warn border-warn/30 bg-warn/10'
                }`}>{c.ok ? 'ok' : 'warn'}</span>
              </div>
              <div className="text-sm font-mono font-bold text-white">{c.tvl}</div>
              <div className="flex justify-between text-[10px] font-mono mt-1">
                <span className={c.flow.startsWith('+') ? 'text-green' : 'text-danger'}>{c.flow}</span>
                <span className="text-green">{c.apy} {t('apy')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* wallet address link */}
      {address && (
        <div className="bg-surface border border-border rounded-xl p-3 flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-mono">{t('balance')} address</span>
          <a
            href={addrUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-cyan hover:text-sky-300 transition"
          >
            {shortAddr(address)} ↗
          </a>
        </div>
      )}
    </div>
  );
}
