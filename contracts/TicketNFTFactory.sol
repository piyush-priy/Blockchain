// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./TicketNFT.sol";

/**
 * @title TicketNFTFactory
 * @dev This contract is a factory for deploying new TicketNFT contracts.
 * Each new contract is owned by the organizer who requests its creation,
 * allowing multiple organizers to manage their own events and funds independently.
 */
contract TicketNFTFactory {
    // Array to keep track of all deployed event contracts for auditing purposes.
    TicketNFT[] public deployedEventContracts;

    /**
     * @dev Emitted when a new event contract has been created.
     * @param eventContract The address of the newly created TicketNFT contract.
     * @param organizer The address of the organizer who owns the new contract.
     */
    event EventContractCreated(address indexed eventContract, address indexed organizer);

    /**
     * @dev Creates and deploys a new TicketNFT contract.
     * The ownership of the new contract is transferred to the message sender (the organizer).
     * Emits an {EventContractCreated} event.
     */
    function createEventContract() external {
        // Create a new TicketNFT contract, passing the creator's address (msg.sender)
        // to the constructor, making them the owner of the new contract.
        TicketNFT newEventContract = new TicketNFT(payable(msg.sender));
        
        // Add the new contract's address to our tracking array.
        deployedEventContracts.push(newEventContract);
        
        // Emit an event so the backend can listen for it and record the new address.
        emit EventContractCreated(address(newEventContract), msg.sender);
    }
}
