import React, { useState } from 'react';
import axios from 'axios';

export default function IssuerPanel({ contract, onRefresh }) {
  const [amount, setAmount] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const uploadToPinata = async (fileToUpload) => {
    const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
    
    let data = new FormData();
    data.append('file', fileToUpload);

    const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
    const pinataSecretApiKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

    if (!pinataApiKey || !pinataSecretApiKey) {
      throw new Error("Missing Pinata API Keys! Please check your .env.local file.");
    }

    const res = await axios.post(url, data, {
      headers: {
        'Content-Type': `multipart/form-data`,
        pinata_api_key: pinataApiKey,
        pinata_secret_api_key: pinataSecretApiKey
      }
    });

    return res.data.IpfsHash; // Returns the Qm... hash
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    if (!file) {
      setError("Please select a verification document to upload to IPFS.");
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // 1. Upload to IPFS
      setStatusMsg("Uploading document to IPFS...");
      const ipfsHash = await uploadToPinata(file);
      
      // 2. Transact on Blockchain
      setStatusMsg(`Document uploaded! (Hash: ${ipfsHash.substring(0,8)}...) Approving transaction...`);
      const tx = await contract.issueCredit(amount, ipfsHash);
      
      setStatusMsg("Waiting for transaction to be mined...");
      await tx.wait(); // Wait for transaction to be mined
      
      setSuccess(`Successfully issued ${amount} Tons! Document securely hashed on IPFS.`);
      setAmount('');
      setFile(null);
      if(onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.reason || err.message || "Failed to issue credit.");
    } finally {
      setLoading(false);
      setStatusMsg('');
    }
  };

  return (
    <div className="glass-card">
      <h2>Issue Carbon Credits</h2>
      <p className="text-muted" style={{marginBottom: '1.5rem'}}>Mint new verified carbon credits onto the blockchain.</p>
      
      <form onSubmit={handleIssue}>
        <div className="form-group">
          <label>Amount (Tons)</label>
          <input 
            type="number" 
            className="form-control" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100"
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label>Verification Document (IPFS)</label>
          <input 
            type="file" 
            className="form-control" 
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
          <small style={{color: 'var(--text-muted)'}}>* This file will be permanently pinned to the InterPlanetary File System.</small>
        </div>

        {error && <div style={{color: 'var(--danger)', marginBottom: '1rem'}}>{error}</div>}
        {success && <div style={{color: 'var(--success)', marginBottom: '1rem'}}>{success}</div>}

        <button type="submit" className="btn" disabled={loading || !amount}>
          {loading ? 'Processing...' : 'Issue Credits'}
        </button>
      </form>
    </div>
  );
}
