# Blockchain-Based Anti-Scalping Ticketing System

This is a decentralized application (dApp) for booking event tickets, built on the Ethereum blockchain. It leverages smart contracts to manage ticket sales, resales, and ownership, with each ticket being a unique Non-Fungible Token (NFT). The application features a React frontend, a Node.js backend for user management, and Solidity smart contracts for on-chain logic.

## Features

  * **User Authentication:** Secure registration and login for users.
  * **Event Creation:** Organizers can create new events, specifying details like name, date, venue, and ticket prices.
  * **Seating Layout Creator:** A visual tool for organizers to design and save the seating arrangement for their events.
  * **NFT-Based Tickets:** Each ticket is minted as an ERC-721 NFT, ensuring verifiable ownership and authenticity.
  * **Seat Selection:** Users can visually select their desired seats for an event.
  * **Ticket Marketplace:** A secondary market where users can list their NFT tickets for sale, with resale price caps set by the event organizer.
  * **Organizer Dashboard:** A dedicated dashboard for event organizers to manage their created events.
  * **User Profile:** A page for users to view their purchased tickets and manage their account.

## How It Works

This application is composed of three main parts: a frontend, a backend, and smart contracts.

### 1\. Smart Contracts (Solidity)

The core logic of the application resides in a set of Solidity smart contracts:

  * **`TicketNFTFactory.sol`:** A factory contract that allows event organizers to deploy new, unique `TicketNFT` contracts for each event they create. This ensures that each event's tickets are managed by a separate, independent contract.
  * **`TicketNFT.sol`:** An ERC-721 compliant contract that represents the tickets for a single event. It handles the minting of new tickets, ownership transfers, and enforces the rules set by the event organizer (like resale limits).
  * **`Marketplace.sol`:** A contract that facilitates the secondary market for tickets. It allows users to list their NFT tickets for sale and other users to purchase them.

### 2\. Backend (Node.js & Express)

The backend is a simple Node.js server that handles tasks that don't need to be on the blockchain, such as:

  * **User Authentication:** Manages user registration and login, issuing JSON Web Tokens (JWT) for session management.
  * **Event Metadata Storage:** Stores event details (like name, description, poster URL) in a database, linking them to the on-chain smart contract address.

### 3\. Frontend (React)

The frontend is a modern React application that provides the user interface for interacting with the dApp. It uses:

  * **Ethers.js:** To communicate with the Ethereum blockchain, allowing users to connect their wallets (like MetaMask) and interact with the smart contracts.
  * **React Router:** For navigating between different pages of the application.
  * **Tailwind CSS:** For styling the user interface.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing.

### Prerequisites

  * **Node.js** (v18 or later recommended)
  * **NPM** (comes with Node.js)
  * A cryptocurrency wallet like **MetaMask** installed in your browser.

### Installation and Setup

1.  **Clone the repository:**

    ```shell
    git clone <your-repository-url>
    cd show-booking-app
    ```

2.  **Install frontend dependencies:**

    ```shell
    npm install
    ```

3.  **Install backend dependencies:**

    ```shell
    cd backend
    npm install
    cd ..
    ```

### Running the Project

1.  **Start a local Hardhat node:**

    This will start a local Ethereum blockchain for development purposes.

    ```shell
    npx hardhat node
    ```

2.  **Deploy the smart contracts:**

    In a new terminal, run the following command to deploy the smart contracts to the local Hardhat node.

    ```shell
    npx hardhat run scripts/deploy.cjs --network localhost
    ```

3.  **Start the backend server:**

    ```shell
    cd backend
    npm start
    cd ..
    ```

4.  **Start the frontend development server:**

    ```shell
    npm run dev
    ```

Your application should now be running. You can open your web browser and navigate to `http://localhost:5173` to use the dApp.

## Available Hardhat Tasks

This project comes with several built-in Hardhat tasks:

  * **Compile the contracts:**

    ```shell
    npx hardhat compile
    ```

  * **Run the tests:**

    ```shell
    npx hardhat test
    ```

  * **Check code coverage:**

    ```shell
    npx hardhat coverage
    ```