import { useState } from 'react';
import { useTranslation } from 'react-i18next';

// ── tiny helpers ──────────────────────────────────────────────────────────────
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max)); }

const AGENTS = [
  { id: 'AGT-01', name: 'Compliance Monitor',  status: 'active', tasks: 14, uptime: '99.8%', last: '2s' },
  { id: 'AGT-02', name: 'Settlement Router',   status: 'active', tasks: 31, uptime: '100%',  last: '0s' },
  { id: 'AGT-03', name: 'Liquidity Optimizer', status: 'paused', tasks: 7,  uptime: '97.2%', last: '4m' },
  { id: 'AGT-04', name: 'Audit Aggregator',    status: 'active', tasks: 9,  uptime: '99.1%', last: '18s' },
];

const PROPOSALS = [
  { id: 'GIP-019', title: 'Upgrade validator set to v2.3',     votes: 87, q: 75, status: 'passed', ends: 'Passed' },
  { id: 'GIP-020', title: 'Increase treasury reserve to 18%',  votes: 61, q: 75, status: 'active', ends: '6h 22m' },
  { id: 'GIP-021', title: 'Enable cross-chain USDC auto-route',votes: 43, q: 75, status: 'active', ends: '2d 4h' },
  { id: 'GIP-022', title: 'Onboard Fireblocks MPC integration', votes: 12, q: 75, status: 'pending',ends: '4d 0h' },
];

const MSIG = [
  { id: 'TX-8841', desc: 'Treasury → Counterparty A',  amount: '240,000 USDC', sigs: 3, req: 5, age: '4m' },
  { id: 'TX-8842', desc: 'Liquidity inject — Pool #7', amount: '80,000 USDC',  sigs: 1, req: 5, age: '11m' },
  { id: 'TX-8843', desc: 'Protocol fee distribution',  amount: '18,400 USDC',  sigs: 5, req: 5, age: '2m' },
];

const AUDIT_RULES = [
  { rule: 'KYC/AML screen',    result: 'pass', detail: '4 entities cleared',    ts: '02:14:01' },
  { rule: 'Sanctions check',   result: 'pass', detail: 'OFAC — no matches',     ts: '02:13:58' },
  { rule: 'Velocity limit',    result: 'pass', detail: 'within 50K/hr band',    ts: '02:13:44' },
  { rule: 'Settlement cap',    result: 'warn', detail: '89% of daily limit',    ts: '02:13:22' },
  { rule: 'Counterparty risk', result: 'pass', detail: 'score: 96.2 / 100',     ts: '02:13:09' },
];

// ── Section header ────────────────────────────────────────────────────────────
function SH({ title, badge, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan pulse-dot shrink-0" />
        <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">{title}</span>
        {badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-500 font-mono">{badge}</span>}
      </div>
      {right && <span className="text-[10px] text-zinc-600 font-mono">{right}</span>}
    </div>
  );
}

// ── Bar chart ─────────────────────────────────────────────────────────────────
function BarChart({ data = [], color = '#00e5ff', h = 48, w = 200 }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const bw = Math.floor(w / data.length) - 2;
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {data.map((v, i) => {
        const bh = (v / max) * h;
        return (
          <rect key={i} x={i * (bw + 2)} y={h - bh} width={bw} height={bh} rx="2"
            fill={color} opacity={i === data.length - 1 ? 1 : 0.4} />
        );
      })}
    </svg>
  );
}

// ── Pipeline SVG ──────────────────────────────────────────────────────────────
function Pipeline({ tick }) {
  const nodes = [
    { label: 'INIT',    sub: 'intake',   x: 50,  y: 65, ok: true  },
    { label: 'VERIFY',  sub: 'KYC',      x: 140, y: 35, ok: true  },
    { label: 'ROUTE',   sub: 'AI',       x: 230, y: 65, ok: false },
    { label: 'SETTLE',  sub: 'USDC',     x: 320, y: 35, ok: true  },
    { label: 'AUDIT',   sub: 'log',      x: 410, y: 65, ok: true  },
    { label: 'CONFIRM', sub: 'on-chain', x: 500, y: 35, ok: true  },
  ];
  const edges = [[0,1],[1,2],[2,3],[3,4],[4,5]];
  const active = tick % nodes.length;
  return (
    <svg width="100%" viewBox="0 0 560 100" style={{ overflow: 'visible' }}>
      {edges.map(([a, b], i) => {
        const na = nodes[a], nb = nodes[b];
        const isAct = i === active || i === active - 1;
        return (
          <line key={i}
            x1={na.x + 16} y1={na.y} x2={nb.x - 16} y2={nb.y}
            stroke={isAct ? '#00e5ff' : '#1a2540'} strokeWidth={isAct ? 1.5 : 1}
            strokeDasharray={isAct ? 'none' : '3,3'} opacity={isAct ? 1 : 0.5}
          />
        );
      })}
      {nodes.map((n, i) => {
        const isAct = i === active;
        const c = n.ok ? '#00c896' : '#00e5ff';
        return (
          <g key={i}>
            {isAct && (
              <circle cx={n.x} cy={n.y} r="22" fill="none" stroke={c} strokeWidth="1" opacity="0.3">
                <animate attributeName="r" values="18;26;18" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={n.x} cy={n.y} r={isAct ? 18 : 15} fill="#0d1422" stroke={c}
              strokeWidth={isAct ? 2 : 1} opacity={isAct ? 1 : 0.7} />
            <text x={n.x} y={n.y - 1} textAnchor="middle" fill={c}
              fontSize="7.5" fontWeight="600" fontFamily="monospace">{n.label}</text>
            <text x={n.x} y={n.y + 8} textAnchor="middle" fill="#4a5a7a"
              fontSize="6.5" fontFamily="monospace">{n.sub}</text>
          </g>
        );
      })}
      <text x="280" y="96" textAnchor="middle" fill="#00e5ff" fontSize="7.5" fontFamily="monospace" opacity="0.7">
        ↑ {(84000 + tick * 37).toLocaleString()} USDC in flight
      </text>
    </svg>
  );
}

// ── Log badge ─────────────────────────────────────────────────────────────────
function LvlBadge({ level }) {
  const map = { ok: ['#00c896','OK'], warn: ['#f59e0b','WARN'], error: ['#ff4466','ERR'], info: ['#00e5ff','INFO'] };
  const [c, t] = map[level] || ['#4a5a7a','LOG'];
  return (
    <span style={{ border: `1px solid ${c}`, color: c }}
      className="text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0">{t}</span>
  );
}

// ── Main CommandCenter ────────────────────────────────────────────────────────
export default function CommandCenter({ tick, velData, usdcFlow, txps, treasury, logs }) {
  const { t } = useTranslation('common');
  const [logFilter, setLogFilter]   = useState('all');
  const [activeGov,  setActiveGov]  = useState(null);

  const usdcM = (treasury / 1_000_000).toFixed(2);
  const filteredLogs = logFilter === 'all' ? logs : logs.filter(l => l.level === logFilter);

  return (
    <div className="flex flex-col gap-4">

      {/* ── ROW 1: Pipeline ─────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <SH title={t('pipeline')} badge="LIVE" right={`batch #${4471 + (tick % 10)}`} />
        <Pipeline tick={tick} />
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            { label: 'avg latency', val: `${(1.2 + rand(-0.2, 0.4)).toFixed(2)}s` },
            { label: 'revert rate', val: '0.00%' },
            { label: 'in queue',    val: `${randInt(3, 12)} txns` },
          ].map(m => (
            <div key={m.label} className="text-center bg-bg rounded-lg py-2">
              <div className="text-sm font-mono font-bold text-cyan">{m.val}</div>
              <div className="text-[9px] text-zinc-600 mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ROW 2: Treasury + Velocity ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* treasury */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <SH title={t('treasury')} right={`$${usdcM}M`} />
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: 'Operational',  pct: 62, color: '#00e5ff', val: `$${(treasury * 0.62 / 1e6).toFixed(2)}M` },
              { label: 'Yield Alloc.', pct: 23, color: '#a259ff', val: `$${(treasury * 0.23 / 1e6).toFixed(2)}M` },
              { label: 'Bridge Buffer',pct: 10, color: '#00c896', val: `$${(treasury * 0.10 / 1e6).toFixed(2)}M` },
              { label: 'Emergency',    pct: 5,  color: '#f59e0b', val: `$${(treasury * 0.05 / 1e6).toFixed(2)}M` },
            ].map(r => (
              <div key={r.label}>
                <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                  <span>{r.label}</span>
                  <span className="font-mono text-zinc-300">{r.val}</span>
                </div>
                <div className="h-1 bg-zinc-800 rounded overflow-hidden">
                  <div className="h-full rounded transition-all duration-700"
                    style={{ width: `${r.pct}%`, background: r.color }} />
                </div>
                <div className="text-[9px] text-zinc-600 font-mono mt-0.5">{r.pct}%</div>
              </div>
            ))}
          </div>
          <div className="text-[9px] text-zinc-600 font-mono mb-1">USDC inflow — last 20 batches</div>
          <BarChart data={usdcFlow.map(v => v / 1000)} color="#00e5ff" h={40} w={300} />
        </div>

        {/* velocity */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <SH title={t('velocity')} right="last 24 intervals" />
          <div className="mb-3">
            <span className="text-2xl font-mono font-bold text-white">{txps}</span>
            <span className="text-xs text-zinc-500 ml-2">tx / second</span>
          </div>
          <BarChart data={velData} color="#a259ff" h={60} w={300} />
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'peak 1h',    val: '28 tx/s' },
              { label: 'avg 24h',    val: '16 tx/s' },
              { label: 'total today',val: `${(tick * 14 + 44210).toLocaleString()}` },
            ].map(m => (
              <div key={m.label} className="text-center">
                <div className="text-sm font-mono font-bold text-purple">{m.val}</div>
                <div className="text-[9px] text-zinc-600 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Agents + Multisig ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* agents */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <SH title={t('agents')} badge="agentic" />
          <div className="flex flex-col gap-2">
            {AGENTS.map(a => (
              <div key={a.id} className={`p-3 bg-bg rounded-lg border ${
                a.status === 'paused' ? 'border-warn/20' : 'border-border'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      a.status === 'active' ? 'bg-green pulse-dot' : 'bg-warn'
                    }`} />
                    <span className="text-xs font-medium text-zinc-200">{a.name}</span>
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono">{a.id}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-[10px] font-mono">
                  <span className="text-zinc-500">{a.tasks} tasks</span>
                  <span className="text-green text-center">{a.uptime}</span>
                  <span className="text-zinc-500 text-right">{a.last} ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* multisig */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <SH title={t('multisig')} badge={`${MSIG.length} pending`} />
          <div className="flex flex-col gap-2">
            {MSIG.map(tx => (
              <div key={tx.id} className="p-3 bg-bg rounded-lg border border-border">
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-purple font-mono">{tx.id}</span>
                  <span className="text-[9px] text-zinc-600 font-mono">{tx.age} ago</span>
                </div>
                <div className="text-[11px] text-zinc-400 mb-2">{tx.desc}</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cyan font-mono font-bold">{tx.amount}</span>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: tx.req }).map((_, i) => (
                      <span key={i} className={`w-2 h-2 rounded-full border ${
                        i < tx.sigs ? 'bg-green border-green/50' : 'bg-transparent border-zinc-700'
                      }`} />
                    ))}
                  </div>
                </div>
                {tx.sigs === tx.req && (
                  <button className="mt-2 w-full py-1 rounded bg-green/10 border border-green/30 text-green text-[10px] font-mono hover:bg-green/20 transition">
                    {t('execute')} →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 4: Governance + Compliance ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* governance */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <SH title={t('governance')} badge="on-chain" />
          <div className="flex flex-col gap-2">
            {PROPOSALS.map(p => (
              <div key={p.id}
                onClick={() => setActiveGov(activeGov === p.id ? null : p.id)}
                className={`p-3 bg-bg rounded-lg border cursor-pointer transition-colors ${
                  activeGov === p.id ? 'border-purple/40' : 'border-border hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-purple font-mono">{p.id}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${
                    p.status === 'passed'  ? 'text-green border-green/30 bg-green/10'   :
                    p.status === 'active'  ? 'text-cyan border-cyan/30 bg-cyan/10'      :
                                             'text-zinc-500 border-zinc-700 bg-transparent'
                  }`}>{p.status}</span>
                </div>
                <div className="text-[11px] text-zinc-400 mb-2">{p.title}</div>
                <div className="h-1 bg-zinc-800 rounded overflow-hidden mb-1">
                  <div className="h-full rounded transition-all"
                    style={{ width: `${Math.min(p.votes, 100)}%`, background: p.votes >= p.q ? '#00c896' : '#a259ff' }} />
                </div>
                <div className="flex justify-between text-[9px] text-zinc-600 font-mono">
                  <span>{p.votes}% voted · quorum {p.q}%</span>
                  <span>{p.ends}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* compliance */}
        <div className="bg-surface border border-border rounded-xl p-4">
          <SH title={t('compliance')} badge="automated" />
          <div className="flex flex-col gap-2">
            {AUDIT_RULES.map((r, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-bg rounded-lg border border-border text-xs">
                <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded border font-mono ${
                  r.result === 'pass' ? 'text-green border-green/30 bg-green/10' : 'text-warn border-warn/30 bg-warn/10'
                }`}>{r.result}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-zinc-300 truncate">{r.rule}</div>
                  <div className="text-[10px] text-zinc-500 truncate">{r.detail}</div>
                </div>
                <span className="text-[9px] text-zinc-600 font-mono shrink-0">{r.ts}</span>
              </div>
            ))}
          </div>

          {/* score ring */}
          <div className="mt-3 flex items-center gap-3 p-3 bg-bg rounded-lg border border-border">
            <svg width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="18" fill="none" stroke="#1a2540" strokeWidth="4" />
              <circle cx="22" cy="22" r="18" fill="none" stroke="#00c896" strokeWidth="4"
                strokeDasharray={`${(98.1 / 100) * 113.1} 113.1`} strokeLinecap="round"
                transform="rotate(-90 22 22)" />
              <text x="22" y="26" textAnchor="middle" fill="#00c896" fontSize="9" fontFamily="monospace" fontWeight="700">98.1</text>
            </svg>
            <div>
              <div className="text-xs text-zinc-300 font-medium">{t('compliance')} {t('score')}</div>
              <div className="text-[10px] text-zinc-600 mt-0.5">AI-verified · updated 2s ago</div>
              <div className="text-[10px] text-green font-mono mt-0.5">↑ +0.7 this session</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 5: Event Log ────────────────────────────────────────── */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <SH title={t('logs')} badge={`${logs.length}`}
          right={
            <select value={logFilter} onChange={e => setLogFilter(e.target.value)}
              className="bg-bg border border-border text-zinc-500 text-[9px] rounded px-1.5 py-0.5 font-mono">
              {['all','ok','info','warn','error'].map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          }
        />
        <div className="max-h-52 overflow-y-auto flex flex-col gap-2">
          {filteredLogs.slice(0, 20).map(l => (
            <div key={l.id} className={`slide-in p-2.5 bg-bg rounded-lg border text-xs flex flex-col gap-1 ${
              l.level === 'error' ? 'border-danger/20' : l.level === 'warn' ? 'border-warn/20' : 'border-border'
            }`}>
              <div className="flex items-center gap-2">
                <LvlBadge level={l.level} />
                <span className="text-[9px] text-zinc-600 font-mono">{l.ts}</span>
                <span className="text-[9px] text-zinc-600 font-mono ml-auto">{l.chain}</span>
              </div>
              <div className={`leading-snug ${
                l.level === 'error' ? 'text-red-300' : l.level === 'warn' ? 'text-yellow-300' : 'text-zinc-400'
              }`}>{l.msg}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
