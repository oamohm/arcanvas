'use client'
import { useState } from 'react'

export default function ArcCanvas() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', color: '#fff', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-1px' }}>ARCCANVAS</h1>
        <button style={{ backgroundColor: '#fff', color: '#000', padding: '8px 20px', borderRadius: '5px', fontWeight: '600' }}>Connect Wallet</button>
      </nav>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Settlement Panel */}
        <div style={{ border: '1px solid #333', padding: '30px', borderRadius: '15px', background: '#1a1a1a' }}>
          <h2 style={{ marginBottom: '20px' }}>USDC Settlement Layer</h2>
          <input type="text" placeholder="Enter USDC Amount" style={{ width: '100%', padding: '15px', background: '#000', border: '1px solid #444', color: '#fff', borderRadius: '8px', marginBottom: '15px' }} />
          <button style={{ width: '100%', padding: '15px', background: '#3b82f6', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 'bold' }}>Execute Transaction</button>
        </div>

        {/* Live Stream Panel */}
        <div style={{ border: '1px solid #333', padding: '30px', borderRadius: '15px', background: '#1a1a1a' }}>
          <h2 style={{ marginBottom: '20px' }}>Deterministic Stream</h2>
          <div style={{ height: '150px', background: '#000', borderRadius: '8px', padding: '15px', color: '#00ff00', fontFamily: 'monospace' }}>
            {'> System Ready...'}<br/>
            {'> Awaiting Settlement Data...'}
          </div>
        </div>
      </div>
    </main>
  )
}
