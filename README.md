# Blockchain-Based Carbon Credit Provenance and Trading System

## Project Description
This project implements a blockchain-based carbon credit provenance system that ensures transparent tracking, ownership verification, and lifecycle management of carbon credits. It has evolved from a smart contract backend into a fully integrated Decentralized Application (dApp) with a React frontend and off-chain IPFS document storage.

### Key Features and Roles
- **Issuer**: Creates carbon credits with verification documents securely hashed and stored on IPFS.
- **Broker / Marketplace**: Facilitates trading by allowing credits to be listed and sold globally.
- **Buyer**: Purchases carbon credits and can eventually retire them to offset their emissions.
- **Regulator / Auditor**: Verifies the complete lifecycle and compliance of the carbon credits.

## Full-Stack Architecture
- **Blockchain**: Polygon Amoy Testnet (or Hardhat Localhost for testing).
- **Smart Contracts**: Solidity ^0.8.20 with OpenZeppelin AccessControl.
- **Frontend**: React + Vite + Ethers.js.
- **Off-chain Storage**: IPFS via Pinata API.

---

## 🚀 Setup & Execution Guide (For Beginners)

To run this complete Decentralized Application on your local machine, follow these steps exactly:

### 1. Start the Blockchain (Terminal 1)
Open a terminal in the root folder (`CarbonCreditTradingSystem`) and start your local Ethereum node:
```bash
npx hardhat node
```
*Leave this terminal running. It will print 20 fake accounts with 10,000 ETH each. Copy the **Private Key of Account #0**.*

### 2. Deploy the Smart Contract (Terminal 2)
Open a **second terminal** in the root folder and deploy the contract to your local node:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
> **Admin Role Challenge**: Originally, the smart contract assigned the `DEFAULT_ADMIN_ROLE` to the deployer, but NOT the `ISSUER_ROLE`, which caused an `AccessControlUnauthorizedAccount` error when trying to issue a credit. To fix this, we updated `scripts/deploy.js` to automatically grant the `ISSUER_ROLE` to the deployer.

### 3. Setup IPFS / Pinata (Off-chain Storage)
To upload verification documents off-chain, we use Pinata.
1. Create a free account at [pinata.cloud](https://app.pinata.cloud/).
2. Create an API Key. **Crucial:** You must toggle **"Admin"** permissions when creating the key, or you will get a `403 Forbidden` error when trying to upload files!
3. Inside the `frontend/` folder, create a file named `.env.local` and add your keys:
```env
VITE_PINATA_API_KEY=your_admin_api_key_here
VITE_PINATA_SECRET_API_KEY=your_admin_secret_key_here
```

### 4. Start the Frontend Web App (Terminal 2)
In the same second terminal, navigate to the frontend folder and start the server:
```bash
cd frontend
npm install
npm run dev
```

### 5. Configure MetaMask
To interact with the frontend, you must configure your web browser:
1. **Install MetaMask**: Download the MetaMask extension for Chrome or Brave.
2. **Create Wallet**: Click "Create a new wallet", agree to terms, and set a simple password (e.g., `password123` for testing).
3. **Add Local Network**: 
   - Open MetaMask, click the Network dropdown, and select "Add a custom network".
   - **Network Name**: `Hardhat Localhost`
   - **RPC URL**: `http://127.0.0.1:8545/`
   - **Chain ID**: `1337`
   - **Currency Symbol**: `ETH`
4. **Import Test Account**:
   - Click the Account profile icon at the top center -> "Import account".
   - Paste the **Private Key for Account #0** that you copied from Terminal 1.
   - You will instantly see a balance of 10,000 ETH and possess the `ISSUER_ROLE`.

### 6. Use the App!
Open your browser to `http://localhost:5173`. Click **Connect MetaMask**, and you will gain full access to issue, list, purchase, and retire carbon credits!

---

## Final Live Deployment (Polygon Amoy)
If you wish to deploy the system live to the internet instead of localhost:
1. Update the `.env` file in the **root** folder with your real `PRIVATE_KEY` and an `ALCHEMY_API_KEY`.
2. Run `npx hardhat run scripts/deploy.js --network amoy`.
3. The frontend will automatically adapt to the live network!
