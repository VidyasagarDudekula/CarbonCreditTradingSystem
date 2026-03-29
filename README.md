# Blockchain-Based Carbon Credit Provenance and Trading System

## Project Description
This project implements a blockchain-based carbon credit provenance system that ensures transparent tracking, ownership verification, and lifecycle management of carbon credits from issuance to retirement. By using Ethereum-compatible smart contracts, the system creates an immutable audit trail, prevents double counting, and establishes a decentralized trust model eliminating reliance on intermediaries.

### Key Features and Roles
- **Issuer**: Creates and registers carbon credits containing associated metadata and off-chain documentation hashes.
- **Broker / Marketplace**: Facilitates trading by allowing credits to be listed and sold.
- **Buyer**: Purchases carbon credits and can eventually retire them to offset their emissions.
- **Regulator / Auditor**: Verifies the complete lifecycle and compliance of the carbon credits.

### Credit Lifecycle States
1. **Issued**: Credit is created by an issuer.
2. **Listed**: Credit is available for sale on the marketplace.
3. **Sold**: Credit is owned by a buyer.
4. **Retired**: Credit is finalized and taken out of circulation (used for emission offsets).

## Folder Structure
- `contracts/`: Smart contract logic and interfaces.
  - `CarbonCredit.sol`: Core smart contract implementing the lifecycle and access control.
  - `interfaces/ICarbonCredit.sol`: Interface defining the core structure and events.
- `scripts/`: Deployment scripts (e.g., `deploy.js`).
- `test/`: Unit tests and integration tests for the smart contracts.

## Dependencies
- [Node.js](https://nodejs.org/) (v16.x or newer)
- [Hardhat](https://hardhat.org/) (Ethereum development environment)
- [@openzeppelin/contracts](https://openzeppelin.com/contracts/) (Secure smart contract library for access control)
- [MetaMask](https://metamask.io/) (Wallet for interaction on the Polygon Amoy Testnet)

## Setup & Deployment Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd CarbonCreditTradingSystem
   ```

2. **Install Dependencies:**
   Install Hardhat and OpenZeppelin contracts dependencies.
   ```bash
   npm install
   ```

3. **Compile Smart Contracts:**
   ```bash
   npx hardhat compile
   ```

4. **Run Tests:**
   Ensure the smart contract logic is sound before deployment.
   ```bash
   npx hardhat test
   ```

5. **Deploy to Local Network:**
   Start a local Hardhat node and deploy the contract.
   ```bash
   npx hardhat node
   npx hardhat run scripts/deploy.js --network localhost
   ```

6. **Deploy to Polygon Amoy Testnet:**
   Update your `.env` file with your `PRIVATE_KEY` and `ALCHEMY_API_KEY` or `INFURA_API_KEY`, then run:
   ```bash
   npx hardhat run scripts/deploy.js --network amoy
   ```
