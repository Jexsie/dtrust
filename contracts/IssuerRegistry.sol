// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IssuerRegistry
 * @notice A simple registry contract to track trusted document issuers by their DID
 * @dev The owner (Dtrust) can add or remove trusted issuers
 */
contract IssuerRegistry {
    /**
     * @notice The owner of the contract (Dtrust)
     */
    address public owner;

    /**
     * @notice Mapping from DID string to trust status
     * @dev isTrusted[did] = true means the issuer with this DID is trusted
     */
    mapping(string => bool) public isTrusted;

    /**
     * @notice Event emitted when an issuer is added to the registry
     * @param did The DID of the issuer that was added
     */
    event IssuerAdded(string indexed did);

    /**
     * @notice Event emitted when an issuer is removed from the registry
     * @param did The DID of the issuer that was removed
     */
    event IssuerRemoved(string indexed did);

    /**
     * @notice Modifier to restrict functions to the owner only
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "IssuerRegistry: caller is not the owner");
        _;
    }

    /**
     * @notice Constructor sets the deployer as the owner
     */
    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Adds an issuer to the trusted registry
     * @param did The DID string of the issuer to add
     * @dev Only the owner can call this function
     */
    function addIssuer(string calldata did) external onlyOwner {
        require(!isTrusted[did], "IssuerRegistry: issuer already trusted");
        isTrusted[did] = true;
        emit IssuerAdded(did);
    }

    /**
     * @notice Removes an issuer from the trusted registry
     * @param did The DID string of the issuer to remove
     * @dev Only the owner can call this function
     */
    function removeIssuer(string calldata did) external onlyOwner {
        require(isTrusted[did], "IssuerRegistry: issuer not in registry");
        isTrusted[did] = false;
        emit IssuerRemoved(did);
    }

    /**
     * @notice Checks if an issuer is trusted
     * @param did The DID string to check
     * @return bool True if the issuer is trusted, false otherwise
     * @dev This is a view function that can be called without a transaction
     */
    function checkTrusted(string calldata did) external view returns (bool) {
        return isTrusted[did];
    }
}

