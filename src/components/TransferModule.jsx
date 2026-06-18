import React, { useState } from 'react';
import { sendArc, sendUsdc, fetchBalances } from '../lib/transfer';

export default function TransferModule({ signer, address, provider }) {
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');

  const handleSend = async () => {
    try {
      await sendArc(signer, to, amount);
      alert('Transfer successful');
    } catch (error) {
      console.error(error);
      alert('Transfer failed');
    }
  };

  return (
    <div className="p-4 border rounded">
      <input 
        placeholder="Recipient address" 
        value={to} 
        onChange={(e) => setTo(e.target.value)} 
        className="block mb-2 p-2 border"
      />
      <input 
        placeholder="Amount" 
        value={amount} 
        onChange={(e) => setAmount(e.target.value)} 
        className="block mb-2 p-2 border"
      />
      <button onClick={handleSend} className="bg-blue-500 text-white p-2">
        Send
      </button>
    </div>
  );
}
