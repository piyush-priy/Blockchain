# Blockchain-Based Anti-Scalping Ticketing System

A full-stack dApp for creating events, minting NFT tickets, and running a resale marketplace with anti-scalping rules.

- Frontend: React + Vite + TailwindCSS + Ethers v6
- Backend: NestJS + Prisma (PostgreSQL) + JWT auth
- Smart contracts: Hardhat + Solidity (Marketplace, TicketNFT, TicketNFTFactory)

This README explains the architecture and gives end-to-end steps to run locally on Windows (PowerShell).

## Quickstart (Windows, from scratch)

Follow these steps in order to get everything running on localhost.

1) Install dependencies

```powershell
# From repo root
npm install
cd backend
npm install
cd ..
```

2) Prepare PostgreSQL

- Ensure PostgreSQL is running and create the database with the expected name/creds, or adjust the backend to your own DSN.
- Defaults used by this repo (and hardcoded in `backend/src/prisma/prisma.service.ts` unless you change it):
  - Host: localhost; Port: 5432; DB: ticket-app; User: postgres; Password: qwerty123

Create DB via psql:

```sql
CREATE DATABASE "ticket-app";
```

3) Configure backend env

Create `backend/.env`:

```ini
DATABASE_URL = "postgresql://<username>:<password>@localhost:<port>/ticket-app?schema=public"
JWT_SECRET=supersecretjwt
PORT=3001
```
# Blockchain-Based Anti-Scalping Ticketing System

A full-stack dApp for creating events, minting NFT tickets, and running a resale marketplace with anti-scalping rules.

- Frontend: React + Vite + TailwindCSS + Ethers v6
- Backend: NestJS + Prisma (PostgreSQL) + JWT auth
- Smart contracts: Hardhat + Solidity (Marketplace, TicketNFT, TicketNFTFactory)

This README explains the architecture and gives end-to-end steps to run locally on Windows (PowerShell).

## Quickstart (Windows, from scratch)

Follow these steps in order to get everything running on localhost.

1) Install dependencies

```powershell
# From repo root
npm install
cd backend
npm install
cd ..
```

2) Prepare PostgreSQL

- Ensure PostgreSQL is running and create the database with the expected name/creds, or adjust the backend to your own DSN.
- Defaults used by this repo (and hardcoded in `backend/src/prisma/prisma.service.ts` unless you change it):
  - Host: localhost; Port: 5432; DB: ticket-app; User: postgres; Password: qwerty123

Create DB via psql:

```sql
CREATE DATABASE "ticket-app";
```

3) Configure backend env

Create `backend/.env`:

```ini
DATABASE_URL = "postgresql://<username>:<password>@localhost:<port>/ticket-app?schema=public"
JWT_SECRET=supersecretjwt
PORT=3001
```

If you use a different Postgres connection, either:
- Edit `backend/src/prisma/prisma.service.ts` to use `process.env.DATABASE_URL`, or
- Replace its hardcoded URL with your DSN directly.

4) Generate Prisma client and apply migrations (one-time)

```powershell
cd backend
npx prisma generate
npx prisma migrate dev
```

If you want to see a real time display of the backend database, run the following command in a separate terminal:
```
npx prisma studio
```

5) Seed admin user (email: admin@ticket.com, password: admin123)

```powershell
cd backend/prisma
node seed_admin.ts
cd ../..
```

6) Start local blockchain and deploy contracts

Open two terminals for these:

- Terminal A — Hardhat node

```powershell
npx hardhat node
```

- Terminal B — Deploy contracts (after node is running)

```powershell
npx hardhat run scripts/deploy.cjs --network localhost
```

This prints two addresses:

```
export const MARKETPLACE_ADDRESS = "0x...";
export const TICKET_NFT_FACTORY_ADDRESS = "0x...";
```

7) Point the frontend at your deployed contracts

Edit `src/config.js` and set both addresses printed in step 6.

8) Start backend and frontend

- Terminal C — Backend (NestJS)

```powershell
cd backend
npm run start:dev
```

- Terminal D — Frontend (Vite)

```powershell
npm run dev
```

Open http://localhost:5173 and log in with the seeded admin to explore the app.

Tip: If the app can’t call contracts, re-check that `src/config.js` matches your latest deploy and that your wallet is on Hardhat Localhost (chainId 31337).

### Verify your setup

- Backend responds at http://localhost:3001/ (you should see NestJS JSON for unknown routes or 404)
- Frontend loads at http://localhost:5173/
- Dev wallet is connected to Hardhat Localhost (chainId 31337)
- `src/config.js` contains the addresses printed by your last deploy
- Login with admin@ticket.com / admin123 works

## Features

- Authentication (JWT): register/login; store wallet to profile
- Event management: create events with date/venue/price caps; organizer dashboard
- Seating layout: visual seat selection and NFT mint per seat
- NFT tickets (ERC-721): one ticket per seat; burn/verify from Scanner
- Marketplace: list/buy tickets with resale price cap
- User profile: view owned tickets, history

## Project structure

```
.
├─ contracts/                  # Solidity sources (Marketplace, TicketNFT, TicketNFTFactory)
├─ scripts/deploy.cjs          # Hardhat deploy script (prints addresses for frontend)
├─ src/                        # React frontend
│  ├─ config.js                # Contract addresses (update after deploy)
│  ├─ context/AppContext.jsx   # App state, wallet connect, API calls
│  └─ pages/                   # UI pages (Catalog, Detail, SeatSelection, Scanner...)
├─ backend/                    # NestJS API (auth, events, tickets)
│  ├─ prisma/schema.prisma     # PostgreSQL schema
│  ├─ prisma/seed_admin.ts     # Seed admin user
│  └─ src/prisma/prisma.service.ts # Prisma client (DB URL currently hardcoded)
├─ hardhat.config.cjs          # Hardhat networks and dev accounts
├─ vite.config.js              # Frontend dev server (default port 5173)
└─ package.json                # Frontend scripts and dev deps
```

## Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask browser extension
- PostgreSQL (local)

Recommended PostgreSQL local setup (matches current code defaults):
- Host: localhost
- Port: 5432
- Database: ticket-app
- User: postgres
- Password: qwerty123

Note: The backend currently overrides DATABASE_URL and connects via a hardcoded URL in `backend/src/prisma/prisma.service.ts`. You can either use the above defaults or change that file to use your own connection string/env.

## Environment variables

- Backend (NestJS):
  - `JWT_SECRET` (required)
  - `PORT` (optional, default 3001)

Create `backend/.env` with at least:

```
DATABASE_URL = "postgresql://<username>:<password>@localhost:<port>/ticket-app?schema=public"
JWT_SECRET=supersecretjwt
PORT=3001
```

If you change the DB connection, also update `backend/src/prisma/prisma.service.ts` to read from `process.env.DATABASE_URL` or to your DSN.


<!-- Consolidated into Quickstart above to avoid duplication -->

<!-- Consolidated Hardhat run steps into Quickstart above to avoid duplication -->

### Optional: Add Hardhat Localhost in MetaMask
- Network name: Hardhat Localhost
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency symbol: ETH

Note: The repo pre-configures 10 funded dev accounts in `hardhat.config.cjs` (local dev only).

<!-- Start commands consolidated into Quickstart above -->

## Key files and contracts

- `contracts/TicketNFTFactory.sol`: Deploys a dedicated `TicketNFT` contract per event
- `contracts/TicketNFT.sol`: ERC-721 tickets per event (seat-based minting)
- `contracts/Marketplace.sol`: Lists/buys tickets (enforces resale price caps)
- `scripts/deploy.cjs`: Deploys Factory and Marketplace and prints addresses for the frontend
- `src/config.js`: Frontend contract addresses—must match your current deployment
- `backend/src/main.ts`: Boots NestJS server (CORS + port)
- `backend/src/prisma/prisma.service.ts`: Prisma connection (currently hardcoded Postgres URL)

## Common issues and fixes

- Contracts call error: "could not decode result data (0x)"
  - Cause: Contracts not deployed to the network your wallet/app is connected to, or `src/config.js` has stale addresses.
  - Fix: Re-run deploy on the correct network and update `src/config.js`. Refresh the app.

- Backend fails to start (JWT error)
  - Cause: `JWT_SECRET` not set.
  - Fix: Create `backend/.env` with `JWT_SECRET` and restart.

- Database connection error
  - Cause: Postgres not running or wrong credentials.
  - Fix: Start Postgres with the defaults above, or update `backend/src/prisma/prisma.service.ts` to your connection.

- CORS or 401 responses from API
  - Ensure backend is on port 3001 and frontend is 5173. Login first; then connect wallet.

- QR Scanner camera not working
  - Ensure you allow camera permissions in your browser. Use Image Upload in Scanner page as fallback.

## Scripts (root)

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "hardhat-deploy": "hardhat run scripts/deploy.cjs --network localhost"
}
```

Run tests and compile contracts:

```powershell
npx hardhat compile
npx hardhat test
```


If you use a different Postgres connection, either:
- Edit `backend/src/prisma/prisma.service.ts` to use `process.env.DATABASE_URL`, or
- Replace its hardcoded URL with your DSN directly.

4) Generate Prisma client and apply migrations (one-time)

```powershell
cd backend
npx prisma generate
npx prisma migrate deploy
```

5) Seed admin user (email: admin@ticket.com, password: admin123)

```powershell
npx ts-node prisma/seed_admin.ts
cd ..
```

6) Start local blockchain and deploy contracts

Open two terminals for these:

- Terminal A — Hardhat node

```powershell
npx hardhat node
```

- Terminal B — Deploy contracts (after node is running)

```powershell
npx hardhat run scripts/deploy.cjs --network localhost
```

This prints two addresses:

```
export const MARKETPLACE_ADDRESS = "0x...";
export const TICKET_NFT_FACTORY_ADDRESS = "0x...";
```

7) Point the frontend at your deployed contracts

Edit `src/config.js` and set both addresses printed in step 6.

8) Start backend and frontend

- Terminal C — Backend (NestJS)

```powershell
cd backend
npm run start:dev
```

- Terminal D — Frontend (Vite)

```powershell
npm run dev
```

Open http://localhost:5173 and log in with the seeded admin to explore the app.

Tip: If the app can’t call contracts, re-check that `src/config.js` matches your latest deploy and that your wallet is on Hardhat Localhost (chainId 31337).

### Verify your setup

- Backend responds at http://localhost:3001/ (you should see NestJS JSON for unknown routes or 404)
- Frontend loads at http://localhost:5173/
- Dev wallet is connected to Hardhat Localhost (chainId 31337)
- `src/config.js` contains the addresses printed by your last deploy
- Login with admin@ticket.com / admin123 works

## Features

- Authentication (JWT): register/login; store wallet to profile
- Event management: create events with date/venue/price caps; organizer dashboard
- Seating layout: visual seat selection and NFT mint per seat
- NFT tickets (ERC-721): one ticket per seat; burn/verify from Scanner
- Marketplace: list/buy tickets with resale price cap
- User profile: view owned tickets, history

## Project structure

```
.
├─ contracts/                  # Solidity sources (Marketplace, TicketNFT, TicketNFTFactory)
├─ scripts/deploy.cjs          # Hardhat deploy script (prints addresses for frontend)
├─ src/                        # React frontend
│  ├─ config.js                # Contract addresses (update after deploy)
│  ├─ context/AppContext.jsx   # App state, wallet connect, API calls
│  └─ pages/                   # UI pages (Catalog, Detail, SeatSelection, Scanner...)
├─ backend/                    # NestJS API (auth, events, tickets)
│  ├─ prisma/schema.prisma     # PostgreSQL schema
│  ├─ prisma/seed_admin.ts     # Seed admin user
│  └─ src/prisma/prisma.service.ts # Prisma client (DB URL currently hardcoded)
├─ hardhat.config.cjs          # Hardhat networks and dev accounts
├─ vite.config.js              # Frontend dev server (default port 5173)
└─ package.json                # Frontend scripts and dev deps
```

## Prerequisites

- Node.js 18+ and npm
- Git
- MetaMask browser extension
- PostgreSQL (local)

Recommended PostgreSQL local setup (matches current code defaults):
- Host: localhost
- Port: 5432
- Database: ticket-app
- User: postgres
- Password: qwerty123

Note: The backend currently overrides DATABASE_URL and connects via a hardcoded URL in `backend/src/prisma/prisma.service.ts`. You can either use the above defaults or change that file to use your own connection string/env.

## Environment variables

- Backend (NestJS):
  - `JWT_SECRET` (required)
  - `PORT` (optional, default 3001)

Create `backend/.env` with at least:

```
JWT_SECRET=supersecretjwt
PORT=3001
```

If you change the DB connection, also update `backend/src/prisma/prisma.service.ts` to read from `process.env.DATABASE_URL` or to your DSN.


<!-- Consolidated into Quickstart above to avoid duplication -->

<!-- Consolidated Hardhat run steps into Quickstart above to avoid duplication -->

### Optional: Add Hardhat Localhost in MetaMask
- Network name: Hardhat Localhost
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency symbol: ETH

Note: The repo pre-configures 10 funded dev accounts in `hardhat.config.cjs` (local dev only).

<!-- Start commands consolidated into Quickstart above -->

## Key files and contracts

- `contracts/TicketNFTFactory.sol`: Deploys a dedicated `TicketNFT` contract per event
- `contracts/TicketNFT.sol`: ERC-721 tickets per event (seat-based minting)
- `contracts/Marketplace.sol`: Lists/buys tickets (enforces resale price caps)
- `scripts/deploy.cjs`: Deploys Factory and Marketplace and prints addresses for the frontend
- `src/config.js`: Frontend contract addresses—must match your current deployment
- `backend/src/main.ts`: Boots NestJS server (CORS + port)
- `backend/src/prisma/prisma.service.ts`: Prisma connection (currently hardcoded Postgres URL)

## Common issues and fixes

- Contracts call error: "could not decode result data (0x)"
  - Cause: Contracts not deployed to the network your wallet/app is connected to, or `src/config.js` has stale addresses.
  - Fix: Re-run deploy on the correct network and update `src/config.js`. Refresh the app.

- Backend fails to start (JWT error)
  - Cause: `JWT_SECRET` not set.
  - Fix: Create `backend/.env` with `JWT_SECRET` and restart.

- Database connection error
  - Cause: Postgres not running or wrong credentials.
  - Fix: Start Postgres with the defaults above, or update `backend/src/prisma/prisma.service.ts` to your connection.

- CORS or 401 responses from API
  - Ensure backend is on port 3001 and frontend is 5173. Login first; then connect wallet.

- QR Scanner camera not working
  - Ensure you allow camera permissions in your browser. Use Image Upload in Scanner page as fallback.

## Scripts (root)

```json
{
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "hardhat-deploy": "hardhat run scripts/deploy.cjs --network localhost"
}
```

Run tests and compile contracts:

```powershell
npx hardhat compile
npx hardhat test
```
