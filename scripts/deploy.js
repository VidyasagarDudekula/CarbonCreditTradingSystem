const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Starting deployment...");

  const CarbonCredit = await hre.ethers.getContractFactory("CarbonCredit");
  const carbonCredit = await CarbonCredit.deploy();

  await carbonCredit.waitForDeployment();
  const address = await carbonCredit.getAddress();

  console.log(`CarbonCredit deployed to: ${address}`);

  const [deployer] = await hre.ethers.getSigners();
  const ISSUER_ROLE = await carbonCredit.ISSUER_ROLE();
  await carbonCredit.grantRole(ISSUER_ROLE, deployer.address);
  console.log(`Granted ISSUER_ROLE to deployer: ${deployer.address}`);

  // Forward-thinking: Save the contract address and ABI for the frontend
  saveFrontendFiles(address);
}

function saveFrontendFiles(contractAddress) {
  const contractsDir = path.join(__dirname, "..", "frontend", "src", "deployed-config.json");

  const CarbonCreditArtifact = artifacts.readArtifactSync("CarbonCredit");

  const configData = {
    address: contractAddress,
    abi: CarbonCreditArtifact.abi,
  };

  fs.writeFileSync(
    contractsDir,
    JSON.stringify(configData, null, 2)
  );

  console.log("Frontend config saved to deployed-config.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
