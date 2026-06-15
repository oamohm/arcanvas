import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

function rand(a,b){return Math.random()*(b-a)+a;}
function randInt(a,b){return Math.floor(rand(a,b));}
function useInterval(cb,ms){const r=useRef(cb);useEffect(()=>{r.current=cb;},[cb]);useEffect(()=>{const t=setInterval(()=>r.current(),ms);return()=>clearInterval(t);},[ms]);}

const INIT_LOGS=[
  {id:1,ts:'02:14:03',level:'info', msg:'Settlement batch #4471 confirmed — 12 txns, 0 reverts',chain:'Arc'},
  {id:2,ts:'02:14:01',level:'ok',  msg:'Multisig 3/5 reached — disbursement released',chain:'Arc'},
  {id:3,ts:'02:13:58',level:'warn',msg:'Gas spike on ETH L1 — routing via L2 bridge',chain:'ETH'},
  {id:4,ts:'02:13:44',level:'info',msg:'AI agent #3 re-scored compliance: 97.4 → 98.1',chain:'Arc'},
  {id:5,ts:'02:13:31',level:'error',msg:'Liquidity rebalance failed — slippage > 0.8%',chain:'ARB'},
  {id:6,ts:'02:13:22',level:'ok',  msg:'Governance proposal #19 executed on-chain',chain:'Arc'},
];
const PROPOSALS=[
  {id:'GIP-019',title:'Upgrade validator set to v2.3',votes:87,quorum:75,status:'passed',ends:'Passed'},
  {id:'GIP-020',title:'Increase treasury reserve to 18%',votes:61,quorum:75,status:'active',ends:'6h 22m'},
  {id:'GIP-021',title:'Enable cross-chain auto-route',votes:43,quorum:75,status:'active',ends:'2d 4h'},
];
const CHAINS=[
  {name:'Arc',   tvl:'12.4M',flow:'+2.1M',apy:'4.2%',c:'#00e5ff',ok:true},
  {name:'ETH',   tvl:'8.9M', flow:'+0.6M',apy:'3.1%',c:'#a259ff',ok:false},
  {name:'ARB',   tvl:'5.3M', flow:'+1.8M',apy:'5.7%',c:'#00c896',ok:true},
  {name:'OP',    tvl:'3.1M', flow:'-0.2M',apy:'4.9%',c:'#f59e0b',ok:true},
];
const AGENTS=[
  {id:'AGT-01',name:'Compliance Monitor', status:'active',tasks:14,uptime:'99.8%'},
  {id:'AGT-02',name:'Settlement Router',  status:'active',tasks:31,uptime:'100%'},
  {id:'AGT-03',name:'Liquidity Optimizer',status:'paused',tasks:7, uptime:'97.2%'},
  {id:'AGT-04',name:'Audit Aggregator',   status:'active',tasks:9, uptime:'99.1%'},
];

function Pill({color,label}){
  const map={ok:'text-green-400 border-green-400/30 bg-green-400/10',warn:'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',error:'text-red-400 border-red-400/30 bg-red-400/10',info:'text-sky-400 border-sky-400/30 bg-sky-400/10'};
  return <span className={`text-[9px] font-mono px-1.5 py-px rounded border ${map[color]||map.info}`}>{label}</span>;
}

function Sparkline({data,color='#00e5ff',h=32,w=100}){
  if(!data||data.length<2)return null;
  const mn=Math.min(...data),mx=Math.max(...data),r=mx-mn||1;
  const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/r)*h}`).join(' ');
  const area=`0,${h} ${pts} ${w},${h}`;
  return(
    <svg width={w} height={h} style={{overflow:'visible'}}>
      <defs><linearGradient id={`g${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.2"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
      </linearGradient></defs>
      <polygon points={area} fill={`url(#g${color.replace('#','')})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={w} cy={h-((data[data.length-1]-mn)/r)*h} r="2.5" fill={color}/>
    </svg>
  );
}

export default function CommandCenter(){
  const { t } = useTranslation('common');
  const [tick,setTick]=useState(0);
  const [logs,setLogs]=useState(INIT_LOGS);
  const [vel,setVel]=useState(()=>Array.from({length:24},()=>randInt(20,90)));
  const [txps,setTxps]=useState(14);
  const [treasury,setTreasury]=useState(4_820_400);
  const [filter,setFilter]=useState('all');

  useInterval(()=>{
    setTick(t=>t+1);
    setVel(d=>[...d.slice(1),randInt(10,100)]);
    setTxps(randInt(8,28));
    setTreasury(v=>v+randInt(-200,800));
    if(Math.random()>0.6){
      const pool=[
        {level:'info', msg:`Batch #${4472+randInt(0,20)} finalized — ${randInt(8,24)} txns`,chain:'Arc'},
        {level:'ok',   msg:`AI re-scored compliance: ${(96+rand(0,3)).toFixed(1)}%`,chain:'Arc'},
        {level:'warn', msg:'Mempool congestion on ETH — rerouting',chain:'ETH'},
        {level:'error',msg:'Agent AGT-03 heartbeat timeout — restarting',chain:'Arc'},
      ];
      const e=pool[randInt(0,pool.length)];
      const now=new Date();
      const ts=`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
      setLogs(l=>[{id:Date.now(),ts,...e},...l].slice(0,40));
    }
  },1800);

  const visLogs=filter==='all'?logs:logs.filter(l=>l.level===filter);
  const usdcM=(treasury/1e6).toFixed(2);

  return(
    <div className="bg-arc-bg min-h-screen p-4 sm:p-6 flex flex-col gap-4">
      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {label:'USDC Treasury',value:`$${usdcM}M`,sub:'reserve',color:'#00e5ff',data:Array.from({length:12},(_,i)=>4.8+Math.sin(i*0.7)*0.3)},
          {label:'TX Velocity',  value:`${txps}/s`, sub:'rolling 60s',color:'#a259ff',data:vel.slice(-12)},
          {label:'Cross-chain TVL',value:'$29.7M', sub:'4 chains',color:'#00c896',data:Array.from({length:12},(_,i)=>27+i*0.1+rand(-0.3,0.3))},
          {label:'Compliance',   value:'98.1',      sub:'AI-scored',color:'#00c896',data:Array.from({length:12},()=>94+rand(0,5))},
        ].map(s=>(
          <div key={s.label} className="rounded-xl border border-arc-border bg-arc-surface p-3 flex flex-col gap-2">
            <div className="text-[9px] text-slate-600 uppercase tracking-widest font-mono">{s.label}</div>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xl font-bold text-white font-mono">{s.value}</div>
                <div className="text-[10px] text-slate-600">{s.sub}</div>
              </div>
              <Sparkline data={s.data} color={s.color} h={28} w={72}/>
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: chains + agents */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-arc-border bg-arc-surface p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-arc-cyan shadow-[0_0_6px_#00e5ff]"/>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Cross-Chain Liquidity</span>
            </div>
            <div className="flex flex-col gap-2">
              {CHAINS.map(c=>(
                <div key={c.name} className="flex items-center gap-3 p-2 rounded-lg bg-arc-bg border border-arc-border">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:c.c}}/>
                  <span className="text-xs font-mono text-white w-8">{c.name}</span>
                  <div className="flex-1">
                    <div className="text-xs font-mono text-slate-200">${c.tvl}</div>
                    <div className={`text-[9px] font-mono ${c.flow.startsWith('+')?'text-arc-green':'text-arc-danger'}`}>{c.flow}</div>
                  </div>
                  <span className="text-[9px] font-mono text-arc-green">{c.apy}</span>
                  <Pill color={c.ok?'ok':'warn'} label={c.ok?'ok':'warn'}/>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-arc-border bg-arc-surface p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-arc-purple shadow-[0_0_6px_#a259ff]"/>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">AI Agents</span>
            </div>
            <div className="flex flex-col gap-2">
              {AGENTS.map(a=>(
                <div key={a.id} className={`p-2.5 rounded-lg bg-arc-bg border ${a.status==='paused'?'border-yellow-400/20':'border-arc-border'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full pulse-dot ${a.status==='active'?'bg-arc-green text-arc-green':'bg-yellow-400 text-yellow-400'}`}/>
                      <span className="text-xs text-slate-300">{a.name}</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-600">{a.id}</span>
                  </div>
                  <div className="flex gap-3 text-[9px] font-mono text-slate-600">
                    <span>{a.tasks} tasks</span>
                    <span className="text-arc-green">{a.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center: tx velocity + compliance */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-arc-border bg-arc-surface p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-arc-purple shadow-[0_0_6px_#a259ff]"/>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">TX Velocity</span>
            </div>
            <div className="text-3xl font-bold text-white font-mono mb-1">{txps} <span className="text-sm font-normal text-slate-600">tx/s</span></div>
            <div className="w-full" style={{height:64}}>
              <svg width="100%" height="64" viewBox="0 0 240 64" preserveAspectRatio="none">
                {vel.map((v,i)=>{
                  const bw=8,bh=(v/100)*60,bx=i*10;
                  return <rect key={i} x={bx} y={64-bh} width={bw} height={bh} rx="2" fill="#a259ff" opacity={i===vel.length-1?1:0.35}/>;
                })}
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-center">
              {[['peak 1h','28/s'],['avg 24h','16/s'],['today',(tick*14+44210).toLocaleString()]].map(([l,v])=>(
                <div key={l}><div className="text-xs font-mono text-arc-purple font-semibold">{v}</div><div className="text-[9px] text-slate-600">{l}</div></div>
              ))}
            </div>
          </div>

          {/* compliance ring */}
          <div className="rounded-xl border border-arc-border bg-arc-surface p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-arc-green shadow-[0_0_6px_#00c896]"/>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Compliance & Audit</span>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="24" fill="none" stroke="#1a2540" strokeWidth="5"/>
                <circle cx="30" cy="30" r="24" fill="none" stroke="#00c896" strokeWidth="5"
                  strokeDasharray={`${(98.1/100)*150.8} 150.8`} strokeLinecap="round" transform="rotate(-90 30 30)"/>
                <text x="30" y="34" textAnchor="middle" fill="#00c896" fontSize="11" fontFamily="monospace" fontWeight="700">98.1</text>
              </svg>
              <div>
                <div className="text-sm text-white font-semibold">Compliance Score</div>
                <div className="text-[10px] text-slate-600 mt-0.5">AI-verified · 2s ago</div>
                <div className="text-[10px] text-arc-green mt-0.5 font-mono">↑ +0.7 session</div>
              </div>
            </div>
            {[
              {rule:'KYC/AML screen',result:'pass',detail:'4 entities cleared'},
              {rule:'Sanctions check', result:'pass',detail:'OFAC — no matches'},
              {rule:'Velocity limit',  result:'pass',detail:'within 50K/hr'},
              {rule:'Settlement cap',  result:'warn',detail:'89% of daily limit'},
            ].map(r=>(
              <div key={r.rule} className="flex items-center gap-2 py-1.5 border-b border-arc-border last:border-0 text-xs">
                <Pill color={r.result==='pass'?'ok':'warn'} label={r.result}/>
                <span className="flex-1 text-slate-400">{r.rule}</span>
                <span className="text-[9px] text-slate-600 font-mono">{r.detail}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: log + governance */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-arc-border bg-arc-surface p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-arc-cyan shadow-[0_0_6px_#00e5ff]"/>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Live Event Log</span>
                <span className="text-[9px] font-mono px-1.5 py-px rounded bg-arc-border text-slate-600">{logs.length}</span>
              </div>
              <select value={filter} onChange={e=>setFilter(e.target.value)}
                className="bg-arc-bg border border-arc-border text-slate-600 text-[9px] rounded px-1.5 py-0.5 font-mono focus:outline-none">
                {['all','ok','info','warn','error'].map(f=><option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="max-h-52 overflow-y-auto flex flex-col gap-1.5">
              {visLogs.map(l=>(
                <div key={l.id} className={`p-2 rounded-lg border text-[10px] slide-in ${l.level==='error'?'border-arc-danger/20 bg-arc-danger/5':l.level==='warn'?'border-yellow-400/20 bg-yellow-400/5':'border-arc-border bg-arc-bg'}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Pill color={l.level} label={l.level.toUpperCase()}/>
                    <span className="font-mono text-slate-600">{l.ts}</span>
                    <span className="font-mono text-slate-700 ml-auto">{l.chain}</span>
                  </div>
                  <div className={`leading-snug ${l.level==='error'?'text-red-400':l.level==='warn'?'text-yellow-400':'text-slate-400'}`}>{l.msg}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-arc-border bg-arc-surface p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-arc-purple shadow-[0_0_6px_#a259ff]"/>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Governance</span>
            </div>
            <div className="flex flex-col gap-2">
              {PROPOSALS.map(p=>(
                <div key={p.id} className="p-2.5 rounded-lg bg-arc-bg border border-arc-border">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-mono text-arc-purple">{p.id}</span>
                    <Pill color={p.status==='passed'?'ok':p.status==='active'?'info':'warn'} label={p.status}/>
                  </div>
                  <div className="text-[10px] text-slate-400 mb-2 leading-snug">{p.title}</div>
                  <div className="h-1 bg-arc-border rounded-full overflow-hidden mb-1">
                    <div className="h-full rounded-full transition-all duration-700" style={{width:`${Math.min(p.votes,100)}%`,background:p.votes>=p.quorum?'#00c896':'#a259ff'}}/>
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-600">
                    <span>{p.votes}% voted</span><span>{p.ends}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-arc-border pt-3 flex items-center justify-between text-[9px] font-mono text-slate-700">
        <span>arcanvas v1.0.0 · arc testnet</span>
        <span>block #{(18_440_000+tick*3).toLocaleString()} · {new Date().toISOString().slice(11,19)} UTC</span>
      </div>
    </div>
  );
}
