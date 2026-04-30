import React, { useState, useEffect } from 'react';
import { getBlockchainConfig } from './utils/blockchain';
import IssuerPanel from './components/IssuerPanel';
import Inventory from './components/Inventory';
import Marketplace from './components/Marketplace';
import './App.css'; // Just clear this or keep empty

// Simple UI helper to shorten address
const shortenAddress = (addr) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

export default function App() {
  const [wallet, setWallet] = useState({ address: null, contract: null, signer: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('market');

  const connectWallet = async () => {
    setLoading(true);
    setError('');
    try {
      const config = await getBlockchainConfig();
      setWallet({ address: config.address, contract: config.contract, signer: config.signer });
    } catch (err) {
      console.error(err);
      setError(`Failed to connect: ${err.message || err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.address) {
    return (
      <div className="container" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh'}}>
        <div className="glass-card" style={{textAlign: 'center', maxWidth: '400px'}}>
          <h1 style={{fontSize: '2rem', marginBottom: '1rem'}}>Carbon Trading System</h1>
          <p style={{color: 'var(--text-muted)', marginBottom: '2rem'}}>Connect your Web3 wallet to interact with the decentralized carbon marketplace.</p>
          {error && <p style={{color: 'var(--danger)'}}>{error}</p>}
          <button className="btn" onClick={connectWallet} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <h1 style={{fontSize: '1.8rem', margin: 0}}>Carbon Exchange</h1>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <span className="address-pill">{shortenAddress(wallet.address)}</span>
        </div>
      </header>

      <div className="tabs">
        <button className={`tab ${activeTab === 'market' ? 'active' : ''}`} onClick={() => setActiveTab('market')}>
          Marketplace (Buyer)
        </button>
        <button className={`tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>
          My Inventory
        </button>
        <button className={`tab ${activeTab === 'issue' ? 'active' : ''}`} onClick={() => setActiveTab('issue')}>
          Issuance (Issuer)
        </button>
      </div>

      <div className="dashboard-grid">
        {activeTab === 'issue' && (
          <IssuerPanel contract={wallet.contract} />
        )}
        
        {activeTab === 'market' && (
           <Marketplace contract={wallet.contract} userAddress={wallet.address} />
        )}

        {activeTab === 'inventory' && (
           <Inventory contract={wallet.contract} userAddress={wallet.address} />
        )}
      </div>
    </div>
  );
}
