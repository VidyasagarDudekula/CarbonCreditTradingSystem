const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("CarbonCredit Trading System", function () {
  
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployCarbonCreditFixture() {
    // Get the Signers here
    const [deployer, issuer, broker, buyer, auditor, unauthorized] = await ethers.getSigners();

    // Deploy the contract
    const CarbonCredit = await ethers.getContractFactory("CarbonCredit");
    const carbonCredit = await CarbonCredit.deploy();

    // Roles defined in the contract
    const DEFAULT_ADMIN_ROLE = await carbonCredit.DEFAULT_ADMIN_ROLE();
    const ISSUER_ROLE = await carbonCredit.ISSUER_ROLE();
    const AUDITOR_ROLE = await carbonCredit.AUDITOR_ROLE();

    // Grant Roles for testing
    await carbonCredit.grantRole(ISSUER_ROLE, issuer.address);
    await carbonCredit.grantRole(AUDITOR_ROLE, auditor.address);

    return { 
      carbonCredit, 
      deployer, 
      issuer, 
      broker, 
      buyer, 
      auditor, 
      unauthorized,
      DEFAULT_ADMIN_ROLE,
      ISSUER_ROLE,
      AUDITOR_ROLE
    };
  }

  describe("Deployment & Roles", function () {
    it("Should set the deployer as DEFAULT_ADMIN_ROLE", async function () {
      const { carbonCredit, deployer, DEFAULT_ADMIN_ROLE } = await loadFixture(deployCarbonCreditFixture);
      expect(await carbonCredit.hasRole(DEFAULT_ADMIN_ROLE, deployer.address)).to.be.true;
    });

    it("Should properly assign ISSUER_ROLE and AUDITOR_ROLE", async function () {
      const { carbonCredit, issuer, auditor, ISSUER_ROLE, AUDITOR_ROLE } = await loadFixture(deployCarbonCreditFixture);
      expect(await carbonCredit.hasRole(ISSUER_ROLE, issuer.address)).to.be.true;
      expect(await carbonCredit.hasRole(AUDITOR_ROLE, auditor.address)).to.be.true;
    });

    it("Should prevent unauthorized users from acting as issuers or auditors", async function () {
      const { carbonCredit, unauthorized, ISSUER_ROLE, AUDITOR_ROLE } = await loadFixture(deployCarbonCreditFixture);
      expect(await carbonCredit.hasRole(ISSUER_ROLE, unauthorized.address)).to.be.false;
      expect(await carbonCredit.hasRole(AUDITOR_ROLE, unauthorized.address)).to.be.false;
    });
  });

  describe("Issuance (issueCredit)", function () {
    it("Should allow an issuer to successfully issue a carbon credit", async function () {
      const { carbonCredit, issuer } = await loadFixture(deployCarbonCreditFixture);
      
      const amount = 100;
      const documentHash = "QmTzQ1...";

      // Check for event emission
      await expect(carbonCredit.connect(issuer).issueCredit(amount, documentHash))
        .to.emit(carbonCredit, "CreditIssued")
        .withArgs(0, issuer.address, amount); // 0 is the first creditId

      // Verify the state of the created credit
      const credit = await carbonCredit.credits(0);
      expect(credit.id).to.equal(0);
      expect(credit.documentHash).to.equal(documentHash);
      expect(credit.currentOwner).to.equal(issuer.address);
      expect(credit.issuer).to.equal(issuer.address);
      expect(credit.amount).to.equal(amount);
      expect(credit.price).to.equal(0);
      expect(credit.state).to.equal(0); // CreditState.Issued is index 0
    });

    it("Should revert if an unauthorized account attempts to issue a credit", async function () {
      const { carbonCredit, unauthorized, ISSUER_ROLE } = await loadFixture(deployCarbonCreditFixture);
      
      const amount = 100;
      const documentHash = "QmTzQ1...";

      // OpenZeppelin AccessControl reverts with a specific custom error
      await expect(carbonCredit.connect(unauthorized).issueCredit(amount, documentHash))
        .to.be.revertedWithCustomError(carbonCredit, "AccessControlUnauthorizedAccount")
        .withArgs(unauthorized.address, ISSUER_ROLE);
    });
  });

  describe("Listing (listCredit)", function () {
    async function deployAndIssueFixture() {
      const setup = await loadFixture(deployCarbonCreditFixture);
      const { carbonCredit, issuer } = setup;
      
      // Issue a credit to list
      const amount = 100;
      const documentHash = "QmTzQ1...";
      await carbonCredit.connect(issuer).issueCredit(amount, documentHash);
      
      return { ...setup, creditId: 0, amount, documentHash };
    }

    it("Should allow the owner to list an issued credit for a valid price", async function () {
      const { carbonCredit, issuer, creditId } = await loadFixture(deployAndIssueFixture);
      const price = ethers.parseEther("0.5");

      await expect(carbonCredit.connect(issuer).listCredit(creditId, price))
        .to.emit(carbonCredit, "CreditListed")
        .withArgs(creditId, price);

      const credit = await carbonCredit.credits(creditId);
      expect(credit.state).to.equal(1); // CreditState.Listed is index 1
      expect(credit.price).to.equal(price);
    });

    it("Should revert if a non-owner tries to list the credit", async function () {
      const { carbonCredit, unauthorized, creditId } = await loadFixture(deployAndIssueFixture);
      const price = ethers.parseEther("0.5");

      await expect(carbonCredit.connect(unauthorized).listCredit(creditId, price))
        .to.be.revertedWith("Not the owner");
    });

    it("Should revert if the price is zero", async function () {
      const { carbonCredit, issuer, creditId } = await loadFixture(deployAndIssueFixture);
      
      await expect(carbonCredit.connect(issuer).listCredit(creditId, 0))
        .to.be.revertedWith("Price must be > 0");
    });

    it("Should revert if the credit is not in the 'Issued' state", async function () {
      const { carbonCredit, issuer, creditId } = await loadFixture(deployAndIssueFixture);
      const price = ethers.parseEther("0.5");

      // List it once to change state to 'Listed'
      await carbonCredit.connect(issuer).listCredit(creditId, price);

      // Try to list it again
      await expect(carbonCredit.connect(issuer).listCredit(creditId, price))
        .to.be.revertedWith("Can only list Issued credits");
    });
  });

  describe("Purchasing (buyCredit)", function () {
    async function deployIssueAndListFixture() {
      const setup = await loadFixture(deployCarbonCreditFixture);
      const { carbonCredit, issuer } = setup;
      
      // Issue
      const amount = 100;
      const documentHash = "QmTzQ1...";
      await carbonCredit.connect(issuer).issueCredit(amount, documentHash);
      
      // List
      const creditId = 0;
      const price = ethers.parseEther("1.0");
      await carbonCredit.connect(issuer).listCredit(creditId, price);

      return { ...setup, creditId, price };
    }

    it("Should allow a buyer to successfully purchase a listed credit", async function () {
      const { carbonCredit, issuer, buyer, creditId, price } = await loadFixture(deployIssueAndListFixture);

      // Track balances to ensure funds are transferred
      const initialIssuerBalance = await ethers.provider.getBalance(issuer.address);
      const initialBuyerBalance = await ethers.provider.getBalance(buyer.address);

      // Buyer purchases the credit
      const tx = await carbonCredit.connect(buyer).buyCredit(creditId, { value: price });
      const receipt = await tx.wait();
      
      // Calculate gas spent
      const gasSpent = receipt.gasUsed * receipt.gasPrice;

      // Expect event
      await expect(tx)
        .to.emit(carbonCredit, "CreditSold")
        .withArgs(creditId, issuer.address, buyer.address);

      // Verify state changes
      const credit = await carbonCredit.credits(creditId);
      expect(credit.currentOwner).to.equal(buyer.address);
      expect(credit.state).to.equal(2); // CreditState.Sold is index 2

      // Verify balances
      const finalIssuerBalance = await ethers.provider.getBalance(issuer.address);
      const finalBuyerBalance = await ethers.provider.getBalance(buyer.address);

      expect(finalIssuerBalance).to.equal(initialIssuerBalance + price);
      expect(finalBuyerBalance).to.equal(initialBuyerBalance - price - gasSpent);
    });

    it("Should revert if trying to buy a credit that is not listed", async function () {
      const setup = await loadFixture(deployCarbonCreditFixture);
      const { carbonCredit, issuer, buyer } = setup;
      
      // Issue but do not list
      await carbonCredit.connect(issuer).issueCredit(100, "Hash");
      const creditId = 0;

      await expect(carbonCredit.connect(buyer).buyCredit(creditId, { value: ethers.parseEther("1.0") }))
        .to.be.revertedWith("Not listed for sale");
    });

    it("Should revert if the buyer sends insufficient funds", async function () {
      const { carbonCredit, buyer, creditId, price } = await loadFixture(deployIssueAndListFixture);
      
      // Send half the price
      const insufficientFunds = price / 2n;

      await expect(carbonCredit.connect(buyer).buyCredit(creditId, { value: insufficientFunds }))
        .to.be.revertedWith("Insufficient funds");
    });
  });

  describe("Retirement (retireCredit)", function () {
    async function setupForRetirementFixture() {
      const setup = await loadFixture(deployCarbonCreditFixture);
      const { carbonCredit, issuer, buyer } = setup;
      
      // Issue
      await carbonCredit.connect(issuer).issueCredit(100, "Hash1"); // ID 0
      
      // Issue & Sell
      await carbonCredit.connect(issuer).issueCredit(200, "Hash2"); // ID 1
      const price = ethers.parseEther("1.0");
      await carbonCredit.connect(issuer).listCredit(1, price);
      await carbonCredit.connect(buyer).buyCredit(1, { value: price });

      return { ...setup, issuedCreditId: 0, soldCreditId: 1 };
    }

    it("Should allow the owner of an Issued credit to retire it", async function () {
      const { carbonCredit, issuer, issuedCreditId } = await loadFixture(setupForRetirementFixture);

      await expect(carbonCredit.connect(issuer).retireCredit(issuedCreditId))
        .to.emit(carbonCredit, "CreditRetired")
        .withArgs(issuedCreditId, issuer.address);

      const credit = await carbonCredit.credits(issuedCreditId);
      expect(credit.state).to.equal(3); // CreditState.Retired is index 3
    });

    it("Should allow the owner of a Sold credit to retire it", async function () {
      const { carbonCredit, buyer, soldCreditId } = await loadFixture(setupForRetirementFixture);

      await expect(carbonCredit.connect(buyer).retireCredit(soldCreditId))
        .to.emit(carbonCredit, "CreditRetired")
        .withArgs(soldCreditId, buyer.address);

      const credit = await carbonCredit.credits(soldCreditId);
      expect(credit.state).to.equal(3);
    });

    it("Should revert if a non-owner tries to retire the credit", async function () {
      const { carbonCredit, unauthorized, issuedCreditId } = await loadFixture(setupForRetirementFixture);

      await expect(carbonCredit.connect(unauthorized).retireCredit(issuedCreditId))
        .to.be.revertedWith("Not the owner");
    });

    it("Should revert if the credit is not in a valid state for retirement (e.g., Listed)", async function () {
      const { carbonCredit, issuer, issuedCreditId } = await loadFixture(setupForRetirementFixture);
      
      // Move to Listed state
      await carbonCredit.connect(issuer).listCredit(issuedCreditId, ethers.parseEther("1.0"));

      await expect(carbonCredit.connect(issuer).retireCredit(issuedCreditId))
        .to.be.revertedWith("Invalid state for retirement");
    });
  });

  describe("Auditor Verification (verifyCredit)", function () {
    async function deployAndIssueFixture() {
      const setup = await loadFixture(deployCarbonCreditFixture);
      const { carbonCredit, issuer } = setup;
      
      const amount = 100;
      const documentHash = "QmTzQ1_VerifiedHash";
      await carbonCredit.connect(issuer).issueCredit(amount, documentHash);
      
      return { ...setup, creditId: 0, documentHash };
    }

    it("Should allow an auditor to retrieve verification data", async function () {
      const { carbonCredit, auditor, creditId, documentHash } = await loadFixture(deployAndIssueFixture);

      const [isValid, retrievedHash, state] = await carbonCredit.connect(auditor).verifyCredit(creditId);
      
      expect(isValid).to.be.true;
      expect(retrievedHash).to.equal(documentHash);
      expect(state).to.equal(0); // Issued state
    });

    it("Should revert if a non-auditor attempts to call verifyCredit", async function () {
      const { carbonCredit, unauthorized, creditId, AUDITOR_ROLE } = await loadFixture(deployAndIssueFixture);

      await expect(carbonCredit.connect(unauthorized).verifyCredit(creditId))
        .to.be.revertedWithCustomError(carbonCredit, "AccessControlUnauthorizedAccount")
        .withArgs(unauthorized.address, AUDITOR_ROLE);
    });
  });

});
