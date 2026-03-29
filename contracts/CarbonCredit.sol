// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/ICarbonCredit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CarbonCredit
 * @dev Implementation of the Carbon Credit Provenance and Trading System.
 * Combines role-based access control, state management, and lifecycle events.
 * 
 * Major Components & Team Responsibilities:
 * - On-chain/Off-chain Integration: Atharva Bhavin Thaker
 * - System Workflow & Integration: Rafeed Arian
 * - Smart Contract Core Logic & RBAC: Samarth Ogale
 * - Stakeholder Modeling Layer: Vaibhav Kokkera Vasu
 * - Transactions & Event Logging: Vidya Sagar Dudekula
 */
contract CarbonCredit is ICarbonCredit, AccessControl {
    
    // ==========================================
    // Roles (Stakeholder Modeling by Vaibhav)
    // ==========================================
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    // Storage (Core logic by Samarth Ogale)
    uint256 private _nextCreditId;
    mapping(uint256 => CarbonCreditData) public credits;
    
    /**
     * @dev Sets up the initial roles. Deployer gets default admin.
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    // ==========================================
    // Core Logic & Lifecycle (Workflow by Rafeed Arian)
    // ==========================================
    
    /**
     * @notice Registers a new carbon credit batch with metadata hash
     * @param _amount Number of credits/tons
     * @param _documentHash Verification document stored off-chain (Atharva)
     */
    function issueCredit(uint256 _amount, string calldata _documentHash) external override onlyRole(ISSUER_ROLE) returns (uint256) {
        uint256 creditId = _nextCreditId++;
        
        credits[creditId] = CarbonCreditData({
            id: creditId,
            documentHash: _documentHash,
            currentOwner: msg.sender,
            issuer: msg.sender,
            amount: _amount,
            price: 0,
            state: CreditState.Issued
        });
        
        // Emitting provenance event (Vidya)
        emit CreditIssued(creditId, msg.sender, _amount);
        return creditId;
    }
    
    /**
     * @notice Lists a previously issued credit on the market (Broker/Marketplace logic)
     */
    function listCredit(uint256 _creditId, uint256 _price) external override {
        CarbonCreditData storage credit = credits[_creditId];
        require(credit.currentOwner == msg.sender, "Not the owner");
        require(credit.state == CreditState.Issued, "Can only list Issued credits");
        require(_price > 0, "Price must be > 0");
        
        credit.state = CreditState.Listed;
        credit.price = _price;
        
        emit CreditListed(_creditId, _price);
    }
    
    /**
     * @notice Buyer purchases a listed carbon credit 
     */
    function buyCredit(uint256 _creditId) external payable override {
        CarbonCreditData storage credit = credits[_creditId];
        require(credit.state == CreditState.Listed, "Not listed for sale");
        require(msg.value >= credit.price, "Insufficient funds");
        
        address oldOwner = credit.currentOwner;
        credit.currentOwner = msg.sender;
        credit.state = CreditState.Sold;
        
        // Transfer funds to the old owner
        (bool success, ) = oldOwner.call{value: msg.value}("");
        require(success, "Transfer failed");
        
        emit CreditSold(_creditId, oldOwner, msg.sender);
    }
    
    /**
     * @notice Owner retires their carbon credit to offset their own footprint
     */
    function retireCredit(uint256 _creditId) external override {
        CarbonCreditData storage credit = credits[_creditId];
        require(credit.currentOwner == msg.sender, "Not the owner");
        require(
            credit.state == CreditState.Issued || credit.state == CreditState.Sold, 
            "Invalid state for retirement"
        );
        
        credit.state = CreditState.Retired;
        
        emit CreditRetired(_creditId, msg.sender);
    }
    
    /**
     * @notice Auditor verification check (Used to show compliance)
     */
    function verifyCredit(uint256 _creditId) external view onlyRole(AUDITOR_ROLE) returns (bool, string memory, CreditState) {
        CarbonCreditData storage credit = credits[_creditId];
        return (true, credit.documentHash, credit.state);
    }
}
