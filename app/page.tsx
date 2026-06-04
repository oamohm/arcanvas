'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { useEffect, useRef, useState } from 'react';
import { Sparkles, Terminal as TermIcon, ShieldAlert } from 'lucide-react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState('System Idle. Connect Wallet to Bootstrap Autonomous Render Pipeline.');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 400);

    // Matrix/Generative Art Structure
    const columns = Math.floor(width / 20);
    const drops: number[] = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 12, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.font = '14px monospace';

      if (isConnected) {
        ctx.fillStyle = '#3b82f6'; // Connected Agent Color (Blue/Neon)
        setStatus('Autonomous Pipeline Active. Rendering Generative Node Matrix for: ' + address);
        
        for (let i = 0; i < drops.length; i++) {
          const text = Math.random() > 0.5 ? '1' : '0';
          const x = i * 20;
          const y = drops[i] * 20;

          ctx.fillText(text, x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      } else {
        ctx.fillStyle = '#3f3f46'; // Idle Color (Dim Gray)
        ctx.fillText('AWAITING CORE IDENTITY SIGNATURE...', width / 2 - 140, height / 2);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = 400;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isConnected, address]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-4 md:p-8">
      {/* Top Header Navigation */}
      <header className="w-full max-w-5xl flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-blue-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-wider uppercase text-zinc-100">CanvasArc</h1>
        </div>
        <ConnectButton showBalance={false} chainStatus="none" accountStatus="avatar" />
      </header>

      {/* Main Terminal and Canvas Space */}
      <section className="w-full max-w-5xl flex-1 grid grid-cols-1 gap-6 mb-6">
        <div className="border border-zinc-800 rounded-lg bg-zinc-950/50 p-2 overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-900 bg-zinc-900/30 rounded-t-md text-xs text-zinc-500">
            <TermIcon className="w-4 h-4 text-zinc-400" />
            <span>AUTONOMOUS_RENDER_CORE_v2.0.0</span>
          </div>
          <div className="w-full bg-black/40 flex-1 min-h-[400px] relative rounded-b-md overflow-hidden">
            <canvas ref={canvasRef} className="w-full block" />
          </div>
        </div>
      </section>

      {/* Live System Logs Status Footer */}
      <footer className="w-full max-w-5xl bg-zinc-950 border border-zinc-900 rounded p-4 text-xs flex items-start gap-3">
        <ShieldAlert className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isConnected ? 'text-blue-500' : 'text-zinc-500'}`} />
        <div className="flex-1 font-mono text-zinc-400">
          <span className="text-zinc-600 font-bold">[LOG]:</span> {status}
        </div>
      </footer>
    </main>
  );
}
