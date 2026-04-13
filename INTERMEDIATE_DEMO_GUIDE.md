# Intermediate Project Demo Guide

This guide is structured to help you get **15/15** on the intermediate project demo rubric. The presentation is designed to last **4.5 to 5.5 minutes**, strictly following the requirements.

---

## Presentation Structure & Times

| Section | Topic | Estimated Time | Rubric Area |
|---------|-------|----------------|-------------|
| 1 | Introduction & Project Status | 1 min 00 sec | Project Status Explanation |
| 2 | Code Walkthrough | 1 min 30 sec | Code Walkthrough |
| 3 | Working Demonstration | 2 min 00 sec | Working Demonstration |
| 4 | Conclusion | 0 min 30 sec | Clarity, Timing & Professionalism |
| **Total** | | **~5 min 00 sec** | |

---

## Script & Execution Steps

### Part 1: Project Status Explanation (1:00)
*Action: Start recording with your screen showing the `README.md` or a quick slide outlining the system architecture components.*

**"Hello everyone. Today I'm presenting the intermediate demo for our Blockchain-Based Carbon Credit Provenance and Trading System. I will briefly explain our current project status:**

*   **What is Implemented**: We have fully implemented our core smart contract, `CarbonCredit.sol`. This includes our Role-Based Access Control using OpenZeppelin, meaning only authorized Issuers can mint credits and only Auditors can verify them. We have also implemented the core state management lifecycle—Issuance, Listing, Purchasing, and Retirement.
*   **Work In Progress**: We are currently in the process of building the integration layer, writing comprehensive unit tests on Hardhat, and building the API connection for our IPFS off-chain document hashes.
*   **Remaining Milestones**: Our main remaining tasks are to build out the frontend web application so our stakeholders can interact with the system via a UI, and to deploy our polished contracts onto the Polygon testnet."

### Part 2: Code Walkthrough (1:30)
*Action: Open `contracts/CarbonCredit.sol` in your IDE.*

**"To show how the components interact, let's look at the core smart contract logic.**

*   *Highlight lines 24-25:* "First, we establish our stakeholder roles using AccessControl, such as `ISSUER_ROLE` and `AUDITOR_ROLE`."
*   *Highlight `issueCredit` function (lines 47-63):* "Here is the entry point of our workflow: `issueCredit`. This function binds a real-world amount of carbon tons to a cryptographic `documentHash`. This is critical for our provenance system. Notice the `onlyRole(ISSUER_ROLE)` modifier ensures strict access control. Upon creation, the credit's state is set to `Issued`."
*   *Highlight `listCredit` function (lines 68-78):* "Once issued, an owner can call `listCredit` to assign a price to it. We use `require` statements to guarantee that only the current owner can list a credit that is currently in the `Issued` state, moving it firmly into the `Listed` state."
*   *Highlight `buyCredit` function (lines 83-97):* "Our settlement happens in `buyCredit`. This function accepts Ether (`payable`), transfers the funds to the previous owner, and legally updates the internal registry to the new buyer, setting the state to `Sold`."
*   *Highlight `retireCredit` function (lines 102-113):* "Finally, `retireCredit` removes the token from circulation forever, preventing double-spending."

### Part 3: Working Demonstration (2:00)
*Action: Open your terminal. Ensure you are in the project root directory. Have the command `npx hardhat run scripts/demo.js` ready.*

**"For our working demonstration, I will run a local Hardhat simulation that connects these smart contract functions into an end-to-end workflow between three stakeholders: a Regulator, an Issuer (like a solar farm), and a Buyer (like a tech corporation)."**

*Action: Hit Enter on `npx hardhat run scripts/demo.js`. Let it run and narrate the output as it prints.*

**"As you can see in the terminal:"**
*   **"Deploys & Roles:** The system is deployed locally, and the regulator grants the `ISSUER_ROLE` to the Solar Farm."
*   **"Phase 1 - Issuance:** The Issuer registers a new batch of 100 Tons. Notice the IPFS Document Hash attached, cementing the provenance."
*   **"Phase 2 - Listing:** Next, the Issuer places that exact credit ID on the marketplace for 0.5 ETH."
*   **"Phase 3 - Purchasing:** The Buyer then executes a transaction sending 0.5 ETH, instantly settling the trade and transferring ownership."
*   **"Phase 4 - Retirement:** Finally, the Buyer interacts with the contract to legally retire the credit. The state is updated, ensuring this credit can never be double-counted or traded again."

### Part 4: Conclusion (0:30)
*Action: Show the final success message on the terminal.*

**"This demonstration proves that our core smart contract safely and accurately facilitates our multi-stakeholder business logic. We successfully traced a credit from its issuance, through the trading marketplace, and finally to an immutable retirement. Thank you for watching."**

---

## Before You Record

1. **Test the script:** Open your terminal and run `npx hardhat run scripts/demo.js` locally to make sure it runs without errors.
2. **Rehearse:** Read through the script out loud while doing the mouse clicks to make sure it feels natural and hits the 4.5 to 5.5-minute sweet spot.
3. **Screen Setup:** Make sure your fonts are large enough to be easily readable on a screen recording.
