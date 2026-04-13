const hre = require("hardhat");

async function main() {
    console.log("\n========================================================");
    console.log("Carbon Credit Provenance and Trading System - DEMO");
    console.log("========================================================\n");

    // Get stakeholders (accounts)
    const [deployer, issuer, broker, buyer] = await hre.ethers.getSigners();
    
    console.log("Stakeholders Initialized:");
    console.log(`   - Regulator (Deployer): ${deployer.address}`);
    console.log(`   - Issuer (e.g. Solar Farm): ${issuer.address}`);
    console.log(`   - Buyer (e.g. Tech Corp): ${buyer.address}\n`);

    // 1. Deploy the Contract
    console.log("[WAIT] Deploying CarbonCredit.sol...");
    const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");
    const carbonCredit = await CarbonCredit.deploy();
    await carbonCredit.waitForDeployment();
    console.log(`[SUCCESS] System deployed to: ${await carbonCredit.getAddress()}\n`);

    // 2. Grant Roles
    console.log("[WAIT] Setting up Access Control...");
    const ISSUER_ROLE = await carbonCredit.ISSUER_ROLE();
    await carbonCredit.grantRole(ISSUER_ROLE, issuer.address);
    console.log("[SUCCESS] ISSUER_ROLE granted to the Issuer account.\n");

    // 3. Issue a Carbon Credit
    console.log("--------------------------------------------------------");
    console.log("PHASE 1: ISSUANCE (Provenance)");
    console.log("--------------------------------------------------------");
    console.log("[WAIT] Issuer is registering a new carbon credit batch (100 Tons)...");
    const documentHash = "QmTzQ1... (IPFS Hash of Verification Document)";
    const issueTx = await carbonCredit.connect(issuer).issueCredit(100, documentHash);
    const issueReceipt = await issueTx.wait();
    
    // Parse the event to get the credit ID (assumes ID 0 for the first one)
    const creditId = 0; 
    console.log(`[SUCCESS] Credit Issued! Credit ID: ${creditId}, Amount: 100 Tons`);
    console.log(`[INFO] Provenance Document Hash attached: ${documentHash}\n`);

    // 4. List the Carbon Credit
    console.log("--------------------------------------------------------");
    console.log("PHASE 2: TRADING / LISTING");
    console.log("--------------------------------------------------------");
    console.log("[WAIT] Issuer is listing Credit ID 0 for sale on the marketplace...");
    const price = hre.ethers.parseEther("0.5"); // 0.5 ETH
    const listTx = await carbonCredit.connect(issuer).listCredit(creditId, price);
    await listTx.wait();
    console.log(`[SUCCESS] Credit Listed successfully at Price: 0.5 ETH\n`);

    // 5. Buy the Carbon Credit
    console.log("--------------------------------------------------------");
    console.log("PHASE 3: PURCHASING (Settlement)");
    console.log("--------------------------------------------------------");
    console.log("[WAIT] Buyer is purchasing Credit ID 0 directly from the marketplace...");
    console.log(`   - Transferring 0.5 ETH from Buyer to Issuer`);
    const buyTx = await carbonCredit.connect(buyer).buyCredit(creditId, { value: price });
    await buyTx.wait();
    console.log("[SUCCESS] Purchase Successful! Ownership transferred to Buyer.\n");

    // 6. Retire the Carbon Credit
    console.log("--------------------------------------------------------");
    console.log("PHASE 4: RETIREMENT (Offsetting Footprint)");
    console.log("--------------------------------------------------------");
    console.log("[WAIT] Buyer is retiring Credit ID 0 to offset their emissions...");
    const retireTx = await carbonCredit.connect(buyer).retireCredit(creditId);
    await retireTx.wait();
    console.log("[SUCCESS] Credit Retired! This credit cannot be sold again.\n");

    // Done
    console.log("========================================================");
    console.log("INTERMEDIATE DEMO COMPLETED SUCCESSFULLY");
    console.log("========================================================\n");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
