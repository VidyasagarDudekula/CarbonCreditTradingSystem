import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const STATE_MAP = ['Issued', 'Listed', 'Sold', 'Retired'];

export default function Inventory({ contract, userAddress }) {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // 1. Fetch all CreditIssued events to get all IDs
      const filter = contract.filters.CreditIssued();
      const events = await contract.queryFilter(filter, 0, 'latest');
      
      const userCredits = [];
      
      // 2. Fetch the current state of each credit
      for (let event of events) {
        const id = event.args[0];
        const creditData = await contract.credits(id);
        
        // 3. Filter by current owner
        if (creditData.currentOwner.toLowerCase() === userAddress.toLowerCase()) {
          userCredits.push({
            id: creditData.id.toString(),
            amount: creditData.amount.toString(),
            price: ethers.formatEther(creditData.price),
            stateCode: Number(creditData.state),
            stateStr: STATE_MAP[Number(creditData.state)]
          });
        }
      }
      setCredits(userCredits.reverse());
    } catch (err) {
      console.error(err);
      setError('Failed to fetch inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(contract) fetchInventory();
  }, [contract, userAddress]);

  const handleList = async (id) => {
    const priceEth = prompt("Enter price in ETH:");
    if (!priceEth) return;
    
    setProcessingId(id);
    try {
      const priceWei = ethers.parseEther(priceEth);
      const tx = await contract.listCredit(id, priceWei);
      await tx.wait();
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert(err.reason || "Failed to list credit");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRetire = async (id) => {
    if(!window.confirm("Are you sure you want to retire this credit permanently?")) return;
    
    setProcessingId(id);
    try {
      const tx = await contract.retireCredit(id);
      await tx.wait();
      fetchInventory();
    } catch (err) {
      console.error(err);
      alert(err.reason || "Failed to retire credit");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="glass-card"><p className="text-muted">Loading your inventory...</p></div>;

  return (
    <div className="glass-card">
      <h2>My Inventory</h2>
      <p className="text-muted" style={{marginBottom: '1.5rem'}}>Manage your owned carbon credits.</p>
      
      {error && <div style={{color: 'var(--danger)', marginBottom: '1rem'}}>{error}</div>}
      
      {credits.length === 0 ? (
        <p className="text-muted" style={{textAlign: 'center', padding: '2rem'}}>You do not own any carbon credits yet.</p>
      ) : (
        credits.map(credit => (
          <div className="credit-item" key={credit.id}>
            <div className="credit-info">
              <h4>Credit ID #{credit.id}</h4>
              <p>{credit.amount} Tons</p>
              <span className={`badge badge-${credit.stateStr.toLowerCase()}`} style={{marginTop: '0.5rem'}}>{credit.stateStr}</span>
            </div>
            <div className="credit-actions">
              {credit.stateCode === 0 && (
                <button className="btn btn-outline" onClick={() => handleList(credit.id)} disabled={processingId === credit.id}>
                  {processingId === credit.id ? '...' : 'List for Sale'}
                </button>
              )}
              {(credit.stateCode === 0 || credit.stateCode === 2) && (
                <button className="btn btn-danger" onClick={() => handleRetire(credit.id)} disabled={processingId === credit.id}>
                  {processingId === credit.id ? '...' : 'Retire'}
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
