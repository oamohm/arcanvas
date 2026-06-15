import { useTranslation } from 'react-i18next';

const NAV = [
  { key: 'overview',    icon: <GridIcon />,   label: 'overview' },
  { key: 'transfer',    icon: <SendIcon />,   label: 'send' },
  { key: 'pipeline',    icon: <FlowIcon />,   label: 'pipeline' },
  { key: 'treasury',    icon: <VaultIcon />,  label: 'treasury' },
  { key: 'liquidity',   icon: <WaveIcon />,   label: 'liquidity' },
  { key: 'compliance',  icon: <ShieldIcon />, label: 'compliance' },
  { key: 'governance',  icon: <VoteIcon />,   label: 'governance' },
  { key: 'agents',      icon: <BotIcon />,    label: 'agents' },
];

export default function Sidebar({ active, setActive, collapsed }) {
  const { t } = useTranslation('common');
  return (
    <aside
      className={`
        hidden md:flex flex-col
        bg-surface border-r border-border
        transition-all duration-200
        ${collapsed ? 'w-14' : 'w-52'}
        shrink-0 h-screen sticky top-0 z-10
      `}
    >
      {/* logo */}
      <div className="flex items-center gap-2 px-4 h-13 border-b border-border">
        <ArcLogo />
        {!collapsed && (
          <span className="font-bold text-sm text-white tracking-tight">arcanvas</span>
        )}
      </div>

      {/* nav */}
      <nav className="flex flex-col gap-1 p-2 mt-1">
        {NAV.map(item => (
          <button
            key={item.key}
            onClick={() => setActive(item.key)}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-150 w-full text-left
              ${active === item.key
                ? 'bg-cyan/10 text-cyan border border-cyan/20'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent'
              }
            `}
          >
            <span className="w-4 h-4 shrink-0">{item.icon}</span>
            {!collapsed && (
              <span className="text-xs uppercase tracking-wider font-mono">
                {t(item.label) ?? item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* bottom status */}
      {!collapsed && (
        <div className="mt-auto p-4 border-t border-border">
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-600">
            <span className="w-1.5 h-1.5 rounded-full bg-green pulse-dot" />
            arc testnet · live
          </div>
        </div>
      )}
    </aside>
  );
}

// ── icons ──────────────────────────────────────────────────────────────────
function ArcLogo() {
  return (
    <div className="w-7 h-7 rounded-md bg-gradient-to-br from-cyan/20 to-purple/20 border border-cyan/30 flex items-center justify-center shrink-0">
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="#00e5ff" strokeWidth="1.2" />
        <circle cx="7" cy="7" r="2" fill="#00e5ff" opacity="0.8" />
      </svg>
    </div>
  );
}
function GridIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/>
    <rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/>
  </svg>;
}
function SendIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M2 8h12M10 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function FlowIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <circle cx="3" cy="8" r="2"/><circle cx="13" cy="4" r="2"/><circle cx="13" cy="12" r="2"/>
    <path d="M5 8l5-4M5 8l5 4" strokeLinecap="round"/>
  </svg>;
}
function VaultIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="2" y="3" width="12" height="10" rx="1"/>
    <circle cx="8" cy="8" r="2.5"/><path d="M8 5.5V4M8 12v-1.5" strokeLinecap="round"/>
  </svg>;
}
function WaveIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M1 8c1-3 2-3 3 0s2 3 3 0 2-3 3 0 2 3 3 0" strokeLinecap="round"/>
  </svg>;
}
function ShieldIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <path d="M8 2L3 4v4c0 3 2.5 5 5 6 2.5-1 5-3 5-6V4L8 2z"/>
    <path d="M6 8l1.5 1.5L10 6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>;
}
function VoteIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="2" y="2" width="12" height="12" rx="1"/>
    <path d="M5 6h6M5 8h4M5 10h5" strokeLinecap="round"/>
  </svg>;
}
function BotIcon() {
  return <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="3" y="5" width="10" height="8" rx="1"/>
    <path d="M8 2v3M6 9h.01M10 9h.01M6 12h4" strokeLinecap="round"/>
    <path d="M1 9h2M13 9h2" strokeLinecap="round"/>
  </svg>;
}
