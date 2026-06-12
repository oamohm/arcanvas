'use client'
import { useState, useCallback } from 'react'

export default function ArcCanvas() {
  // Enhanced state management with transaction handling
  const [session, setSession] = useState({ 
    email: null, 
    wallet: null, 
    status: 'ready',
    isConnecting: false,
    transactionInProgress: false 
  })
  const [stream, setStream] = useState([
    'Arc Engine: Initialized', 
    'Waiting for User Input...'
  ])
  const [formData, setFormData] = useState({
    email: '',
    amount: ''
  })
  const [error, setError] = useState(null)

  // Add stream message with timestamp
  const addStreamMessage = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString()
    setStream(prev => [...prev, `[${timestamp}] ${message}`])
  }, [])

  // Wallet connection with proper error handling
  const connectWallet = useCallback(async () => {
    try {
      setSession(prev => ({ ...prev, isConnecting: true }))
      setError(null)
      addStreamMessage('Initiating wallet connection...')

      // Simulate wallet connection with timeout
      const walletAddress = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Wallet connection timeout'))
        }, 10000)

        // Mock wallet connection
        setTimeout(() => {
          clearTimeout(timeout)
          resolve('0x' + Math.random().toString(16).slice(2, 42))
        }, 1000)
      })

      setSession(prev => ({ 
        ...prev, 
        wallet: walletAddress,
        status: 'connected',
        isConnecting: false 
      }))
      addStreamMessage(`Wallet Address Verified: ${walletAddress}`)
      addStreamMessage('Deterministic Path Active')
    } catch (err) {
      setError(err.message)
      addStreamMessage(`Connection Error: ${err.message}`)
      setSession(prev => ({ ...prev, isConnecting: false }))
    }
  }, [addStreamMessage])

  // Wallet disconnect with cleanup
  const disconnectWallet = useCallback(() => {
    try {
      addStreamMessage('Initiating wallet disconnection...')
      setSession({ 
        email: null, 
        wallet: null, 
        status: 'ready',
        isConnecting: false,
        transactionInProgress: false 
      })
      setFormData({ email: '', amount: '' })
      setError(null)
      addStreamMessage('Wallet disconnected successfully')
      addStreamMessage('Ready for new connection')
    } catch (err) {
      addStreamMessage(`Disconnection Error: ${err.message}`)
    }
  }, [addStreamMessage])

  // Enhanced transaction execution with retry logic
  const executeTransaction = useCallback(async () => {
    if (!session.wallet) {
      setError('Wallet not connected')
      addStreamMessage('Error: Wallet not connected')
      return
    }

    if (!formData.email || !formData.amount) {
      setError('Please fill in all fields')
      addStreamMessage('Error: Missing required fields')
      return
    }

    const maxRetries = 3
    let retryCount = 0

    const executeWithRetry = async () => {
      try {
        setSession(prev => ({ ...prev, transactionInProgress: true }))
        setError(null)
        addStreamMessage(`Executing transaction - Attempt ${retryCount + 1}/${maxRetries}`)
        addStreamMessage(`Amount: ${formData.amount} USDC`)
        addStreamMessage(`Email: ${formData.email}`)

        // Simulate transaction with timeout
        const result = await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Transaction timeout'))
          }, 15000)

          setTimeout(() => {
            clearTimeout(timeout)
            // Simulate 70% success rate for demo
            if (Math.random() > 0.3) {
              resolve({
                hash: '0x' + Math.random().toString(16).slice(2, 66),
                status: 'success'
              })
            } else {
              reject(new Error('Transaction failed: Insufficient funds'))
            }
          }, 2000)
        })

        addStreamMessage(`Transaction Hash: ${result.hash}`)
        addStreamMessage('Transaction Status: Confirmed')
        addStreamMessage('Settlement Layer: Active')
        setSession(prev => ({ ...prev, transactionInProgress: false }))
        setFormData({ email: '', amount: '' })

      } catch (err) {
        if (retryCount < maxRetries - 1) {
          retryCount++
          addStreamMessage(`Retry scheduled in 2 seconds... (${retryCount}/${maxRetries - 1})`)
          await new Promise(resolve => setTimeout(resolve, 2000))
          return executeWithRetry()
        } else {
          throw err
        }
      }
    }

    try {
      await executeWithRetry()
    } catch (err) {
      setError(err.message)
      addStreamMessage(`Transaction Failed: ${err.message}`)
      addStreamMessage('Please try again or check your wallet balance')
      setSession(prev => ({ ...prev, transactionInProgress: false }))
    }
  }, [session.wallet, formData, addStreamMessage])

  return (
    <main style={{ minHeight: '100vh', background: '#0a0a0a', color: '#ededed', padding: '40px', fontFamily: 'monospace' }}>
      <header style={{ borderBottom: '1px solid #333', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>ARCCANVAS // BUILDER</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>
            Status: <span style={{ color: session.status === 'connected' ? '#0f0' : '#f00' }}>
              {session.status.toUpperCase()}
            </span>
          </span>
          {session.wallet ? (
            <>
              <button 
                onClick={disconnectWallet}
                disabled={session.transactionInProgress}
                style={{ 
                  background: '#dc2626', 
                  border: 'none', 
                  padding: '10px 20px', 
                  cursor: session.transactionInProgress ? 'not-allowed' : 'pointer',
                  opacity: session.transactionInProgress ? 0.5 : 1,
                  color: '#fff',
                  borderRadius: '4px'
                }}
              >
                Disconnect
              </button>
              <span style={{ fontSize: '12px', color: '#0f0' }}>
                {session.wallet.slice(0, 6)}...{session.wallet.slice(-4)}
              </span>
            </>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={session.isConnecting}
              style={{ 
                background: '#fff', 
                border: 'none', 
                padding: '10px 20px', 
                cursor: session.isConnecting ? 'not-allowed' : 'pointer',
                opacity: session.isConnecting ? 0.5 : 1,
                color: '#000',
                borderRadius: '4px',
                fontWeight: 'bold'
              }}
            >
              {session.isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </header>

      {error && (
        <div style={{ 
          background: '#7f1d1d', 
          border: '1px solid #dc2626', 
          color: '#fca5a5',
          padding: '15px', 
          marginTop: '20px',
          borderRadius: '4px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '40px' }}>
        {/* Settlement Layer */}
        <div style={{ border: '1px solid #333', padding: '30px', borderRadius: '8px' }}>
          <h2>Settlement Layer</h2>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
            Execute deterministic settlements with wallet verification and transaction tracking.
          </p>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
              Verification Email
            </label>
            <input 
              type="email" 
              placeholder="your@email.com" 
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!session.wallet || session.transactionInProgress}
              style={{ 
                width: '100%', 
                padding: '10px', 
                background: '#111', 
                color: '#fff', 
                border: '1px solid #444', 
                marginBottom: '0px',
                borderRadius: '4px',
                opacity: !session.wallet || session.transactionInProgress ? 0.5 : 1,
                cursor: !session.wallet || session.transactionInProgress ? 'not-allowed' : 'text'
              }} 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#aaa', marginBottom: '5px' }}>
              USDC Amount
            </label>
            <input 
              type="number" 
              placeholder="Enter amount" 
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              disabled={!session.wallet || session.transactionInProgress}
              style={{ 
                width: '100%', 
                padding: '10px', 
                background: '#111', 
                color: '#fff', 
                border: '1px solid #444', 
                marginBottom: '0px',
                borderRadius: '4px',
                opacity: !session.wallet || session.transactionInProgress ? 0.5 : 1,
                cursor: !session.wallet || session.transactionInProgress ? 'not-allowed' : 'text'
              }} 
            />
          </div>

          <button 
            onClick={executeTransaction}
            disabled={!session.wallet || session.transactionInProgress}
            style={{ 
              width: '100%', 
              padding: '12px', 
              background: session.wallet && !session.transactionInProgress ? '#2563eb' : '#4b5563', 
              color: '#fff', 
              border: 'none', 
              fontWeight: 'bold',
              cursor: session.wallet && !session.transactionInProgress ? 'pointer' : 'not-allowed',
              opacity: session.wallet && !session.transactionInProgress ? 1 : 0.5,
              borderRadius: '4px'
            }}
          >
            {session.transactionInProgress ? 'Processing...' : 'Execute Transaction'}
          </button>

          <p style={{ fontSize: '12px', color: '#888', marginTop: '15px' }}>
            {!session.wallet ? '⚠️ Connect wallet to proceed' : '✓ Ready to execute'}
          </p>
        </div>

        {/* Live Streaming Feed */}
        <div style={{ border: '1px solid #333', padding: '30px', borderRadius: '8px' }}>
          <h2>Deterministic Stream</h2>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '15px' }}>
            Real-time event log with timestamps and transaction confirmations.
          </p>
          
          <div style={{ 
            background: '#000', 
            height: '400px', 
            padding: '15px', 
            color: '#0f0', 
            overflowY: 'auto', 
            borderRadius: '4px', 
            fontSize: '12px',
            border: '1px solid #222',
            fontFamily: '"Courier New", monospace'
          }}>
            {stream.length === 0 ? (
              <p style={{ color: '#666' }}>No events yet...</p>
            ) : (
              stream.map((line, i) => (
                <p key={i} style={{ margin: '4px 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {'> '}{line}
                </p>
              ))
            )}
          </div>

          <div style={{ marginTop: '15px', fontSize: '11px', color: '#666' }}>
            <p>Total Events: {stream.length}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: '60px', paddingTop: '20px', borderTop: '1px solid #333', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        <p>ArcCanvas © 2026 | Deterministic Settlement Layer | Powered by Next.js + Wagmi</p>
      </footer>
    </main>
  )
}
