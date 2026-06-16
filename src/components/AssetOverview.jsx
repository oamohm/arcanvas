import { useTranslation } from 'react-i18next';
import { fmt, shortAddr } from '@/lib/arc';

function Sparkline({ data = [], color = '#00a5ff', w = 100, h = 32 }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const area = `0,${h} ${pts} ${w},${h}`;
  const gradId = `grad${color.replace('#', '')}`;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      {data.length > 1 && (
        <circle cx={w} cy={h - ((data[data.length - 1] - min) / range) * h} r="2.5" fill={color} />
      )}
    </svg>
  );
}

function StatCard({ label, value, sub, delta, chart, color = '#00a5ff' }) {
  const up = delta?.startsWith('+');
  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
      <div className="text-zinc-400 uppercase tracking-widest font-mono text-sm">{label}</div>
      <div className="flex items-end justify-between gap-2">
        <div>
          <div className="text-xl font-bold text-white">{value}</div>
          {sub && <div className="text-xs text-zinc-500">{sub}</div>}
        </div>
        {delta && (
          <div className={`text-xs font-mono st-1 ${up ? 'text-green-500' : 'text-red-500'}`}>
            {up ? '▲ ' : '▼ '}{delta}
          </div>
        )}
      </div>
      {chart && <Sparkline data={chart} color={color} />}
    </div>
  );
}

export default function AssetOverview({ balances = {}, address, tick }) {
  const { t } = useTranslation('common');
  const ethChart = Array.from({ length: 16 }, (_, i) => 4.8 + Math.sin(i * 0.7) * 0.3 + i * 0.01);
  const usdcChart = Array.from({ length: 16 }, (_, i) => 4.1 + Math.random() * 0.8);
  const tvlChart = Array.from({ length: 16 }, (_, i) => 27 + i * 0.15 + Math.random() * 0.4);
  const compChart = Array.from({ length: 16 }, (_, i) => 94 + Math.random() * 5);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label={t('balance') + ' - ARC'}
          value={fmt(balances?.arc || 0, 6)}
          sub="native token"
          delta={address ? 'live' : null}
          chart={ethChart}
          color="#00a5ff"
        />
        <StatCard
          label={t('balance') + ' - USDC'}
          value={fmt(balances?.usdc || 0, 2)}
          sub="arc testnet"
          chart={usdcChart}
          color="#01c096"
        />
      </div>
    </div>
  );
}
