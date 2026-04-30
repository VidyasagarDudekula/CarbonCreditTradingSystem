import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const STATE_MAP = ['Issued', 'Listed', 'Sold', 'Retired'];

export default function Marketplace({ contract, userAddress }) {
  const [listedCredits, setListedCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState('');

  const fetchMarket = async () => {
    setLoading(true);
    try {
      const filter = contract.filters.CreditIssued();
      const events = await contract.queryFilter(filter, 0, 'latest');
      
      const market = [];
      
      for (let event of events) {
        const id = event.args[0];
        const creditData = await contract.credits(id);
        
        // 1 is 'Listed' state
        if (Number(creditData.state) === 1) {
          market.push({
            id: creditData.id.toString(),
            amount: creditData.amount.toString(),
            priceEth: ethers.formatEther(creditData.price),
            priceWei: creditData.price,
            owner: creditData.currentOwner
          });
        }
      }
      setListedCredits(market.reverse());
    } catch (err) {
      console.error(err);
      setError('Failed to fetch marketplace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(contract) fetchMarket();
  }, [contract]);

  const handleBuy = async (credit) => {
    setProcessingId(credit.id);
    try {
      const tx = await contract.buyCredit(credit.id, { value: credit.priceWei });
      await tx.wait();
      fetchMarket(); // refresh market
      alert("Purchase successful! Check your inventory.");
    } catch (err) {
      console.error(err);
      alert(err.reason || "Failed to purchase credit");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="glass-card"><p className="text-muted">Loading marketplace...</p></div>;

  return (
    <div className="glass-card">
      <h2>Marketplace</h2>
      <p className="text-muted" style={{marginBottom: '1.5rem'}}>Purchase verified carbon credits.</p>
      
      {error && <div style={{color: 'var(--danger)', marginBottom: '1rem'}}>{error}</div>}
      
      {listedCredits.length === 0 ? (
        <p className="text-muted" style={{textAlign: 'center', padding: '2rem'}}>No credits are currently listed for sale.</p>
      ) : (
        listedCredits.map(credit => (
          <div className="credit-item" key={credit.id}>
            <div className="credit-info">
              <h4>Credit ID #{credit.id}</h4>
              <p>{credit.amount} Tons</p>
              <p style={{fontSize: '0.8rem'}} className="text-muted">Seller: {credit.owner.substring(0,6)}...{credit.owner.substring(38)}</p>
            </div>
            <div className="credit-actions">
              <span style={{fontWeight: 'bold', marginRight: '1rem', display: 'flex', alignItems: 'center'}}>{credit.priceEth} ETH</span>
              <button 
                className="btn" 
                onClick={() => handleBuy(credit)} 
                disabled={processingId === credit.id || credit.owner.toLowerCase() === userAddress.toLowerCase()}
              >
                {processingId === credit.id ? 'Processing...' : (credit.owner.toLowerCase() === userAddress.toLowerCase() ? 'Your Listing' : 'Buy')}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
