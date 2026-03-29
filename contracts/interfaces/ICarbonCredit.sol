// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICarbonCredit
 * @dev Interface for the Carbon Credit Provenance and Trading System.
 * Outlines the standard behavior for the carbon lifecycle (Issued, Listed, Sold, Retired).
 */
interface ICarbonCredit {
    
    // ==========================================
    // Events (Provenance Tracking)
    // Designed by: Vidya Sagar Dudekula, Vaibhav Kokkera Vasu
    // ==========================================
    
    event CreditIssued(uint256 indexed creditId, address indexed issuer, uint256 amount);
    event CreditListed(uint256 indexed creditId, uint256 price);
    event CreditSold(uint256 indexed creditId, address indexed oldOwner, address indexed newOwner);
    event CreditRetired(uint256 indexed creditId, address indexed retiree);
    
    // ==========================================
    // Structs & Enums (System Integration & Data Structure)
    // Designed by: Rafeed Arian & Samarth Ogale
    // ==========================================
    
    enum CreditState { Issued, Listed, Sold, Retired }
    
    struct CarbonCreditData {
        uint256 id;
        // On-chain / Off-chain Data Integration (Designed by Atharva Bhavin Thaker)
        string documentHash; // IPFS or off-chain hash reference for verification
        address currentOwner;
        address issuer;
        uint256 amount;
        uint256 price;
        CreditState state;
    }
    
    // ==========================================
    // Core Functions
    // ==========================================
    
    /**
     * @dev Issues a new carbon credit to the system. 
     *      Only approved issuers can call this function.
     * @param _amount The amount of carbon offset (e.g., in tons).
     * @param _documentHash Hash of the external certification document.
     * @return Newly created credit ID.
     */
    function issueCredit(uint256 _amount, string calldata _documentHash) external returns (uint256);
    
    /**
     * @dev Lists an issued credit for sale on the marketplace.
     * @param _creditId The identifier of the carbon credit.
     * @param _price The price configured by the seller for this asset.
     */
    function listCredit(uint256 _creditId, uint256 _price) external;
    
    /**
     * @dev Allows a buyer to purchase a listed carbon credit.
     * @param _creditId The identifier of the carbon credit.
     */
    function buyCredit(uint256 _creditId) external payable;
    
    /**
     * @dev Retires a purchased carbon credit to offset the buyer's emissions.
     *      This is the final state.
     * @param _creditId The identifier of the carbon credit.
     */
    function retireCredit(uint256 _creditId) external;
}
