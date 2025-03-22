import React, { useState } from 'react';
import { createCharity } from '../services/blockchain';

export default function AdminPanel({ ownerAddress, currentAccount }) {
  const [name, setName] = useState('');
  const [goal, setGoal] = useState('');
  const [durationDays, setDurationDays] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (currentAccount.toLowerCase() !== ownerAddress.toLowerCase()) {
      alert('Only contract owner can create charities');
      return;
    }
    await createCharity(name, goal, durationDays);
    setName('');
    setGoal('');
  };

  return (
    <div className="admin-panel">
      <h2>Create New Charity</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Charity Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Funding Goal (ETH):</label>
          <input
            type="number"
            step="0.01"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Duration (Days):</label>
          <input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Charity</button>
      </form>
    </div>
  );
}