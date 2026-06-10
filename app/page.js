'use client'
import { useState } from 'react'

export default function ArcCanvas() {
  const [user, setUser] = useState({ email: null, wallet: null })
  const [stream, setStream] = useState(['System Initialized', 'Awaiting deterministic input...'])

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem', fontFamily: 'monospace' }}>
      {/* हेडर और ऑथेंटिकेशन */}
      <header style={{ borderBottom: '1px solid #333', marginBottom: '2rem' }}>
        <h1>arccanvas</h1>
        {!user.email ? (
          <div style={{ padding: '10px 0' }}>
            <input type="email" placeholder="email address" id="email" />
            <button onClick={() => setUser({...user, email: 'user@arc.net'})}>authenticate</button>
          </div>
        ) : (
          <p>active user: {user.email} | <button onClick={() => setUser({...user, wallet: '0x... connected'})}>connect wallet</button></p>
        )}
      </header>

      {/* मुख्य फीचर लेयर */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h2>usdc settlement</h2>
          <input type="number" placeholder="amount" style={{ width: '100%', marginBottom: '10px' }} />
          <button style={{ width: '100%' }}>execute settlement</button>
        </div>
        
        <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
          <h2>stream feed</h2>
          <div style={{ height: '150px', overflowY: 'auto' }}>
            {stream.map((line, i) => <p key={i}>{'> '}{line}</p>)}
          </div>
        </div>
      </section>
    </main>
  )
}
