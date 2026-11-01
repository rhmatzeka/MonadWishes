# 🎉 MonadWishes — Social Birthday Gift Vault & Yield Pool on Monad Blockchain

[![Monad Testnet](https://img.shields.io/badge/Monad-Testnet_10143-836EF9?style=for-the-badge&logo=ethereum&logoColor=white)](https://testnet.monadexplorer.com)
[![Vercel Deployment](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://monad-wishes-xi.vercel.app/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Envio Indexer](https://img.shields.io/badge/Envio-HyperIndex_GraphQL-FFD600?style=for-the-badge)](https://envio.dev)
[![Pyth Network](https://img.shields.io/badge/Pyth-Live_MON%2FUSD-00E5FF?style=for-the-badge)](https://pyth.network)

> **MonadWishes** is a decentralized, time-locked social birthday gift vault and yield-generating pool built natively on the **Monad Blockchain**. Friends & family contribute **MON** tokens along with personalized greetings. While locked, contributions are deployed into Monad's native staking protocol to generate yield. On the recipient's birthday, the pool unlocks, transferring accumulated MON + yield and minting a **Dynamic 100% On-Chain SVG NFT Gift Booklet**.

---

![MonadWishes landing page: create a birthday vault or explore vaults](docs/images/preview.png)

## 🌐 Live Application & Links

- **🚀 Live Web App**: [https://monad-wishes-xi.vercel.app/](https://monad-wishes-xi.vercel.app/)
- **📜 Vault Smart Contract (Monad Testnet)**: [`0xd3146Aabe8a4f50426d0d12A67ecca0ebEB06764`](https://testnet.monadexplorer.com/address/0xd3146Aabe8a4f50426d0d12A67ecca0ebEB06764)
- **🎨 NFT Booklet Contract (Monad Testnet)**: [`0x80994d808075041964605fCA72E7858b861c2c01`](https://testnet.monadexplorer.com/address/0x80994d808075041964605fCA72E7858b861c2c01)
- **⚡ Envio HyperIndex GraphQL Endpoint**: [`https://indexer.dev.hyperindex.xyz/d13d863/v1/graphql`](https://indexer.dev.hyperindex.xyz/d13d863/v1/graphql)

---

## 🔥 Key Innovation & Outstanding Monad Features

### 1. ⚡ Exploiting Monad's 0.3s Block Time & Sub-Second Finality
Monad's high-throughput parallel execution engine provides **0.3-second block time** and instant finality. MonadWishes leverages this speed to deliver real-time contribution feedback, instant wish wall updates, and sub-second transaction mining toasts.

### 2. 🥩 Monad Native Staking Precompile Integration (`0x1000`)
Instead of sitting idle in a basic vault, pooled birthday gifts are automatically staked to Monad's native staking precompile at `0x0000000000000000000000000000000000001000`. The funds earn native staking yield over the vault's lock duration (e.g. 30 days) and payout MON + yield upon birthday release.

### 3. 🎨 Dynamic 100% On-Chain SVG NFT Booklet
When the birthday recipient releases their gift, the contract automatically mints a **Monad Birthday Gift NFT Booklet**. The metadata and visual vector graphics are generated **100% on-chain** in pure Solidity string formatting—storing the recipient's name, total MON collected, total greetings count, and yield generated without external IPFS dependencies.

### 4. 🔮 Pyth Network Live MON/USD Price Feed
Integrated directly with Pyth Network's Hermes Price Service to display live, low-latency **MON/USD** valuation across the UI and gift pool targets.

### 5. 📊 Real-Time Envio HyperIndex GraphQL Indexer
MonadWishes indexes all on-chain contract events (`VaultCreated`, `ContributionReceived`, `StakedInMonadPrecompile`, `GiftClaimed`) using an **Envio HyperIndex GraphQL** indexer, backed by an automatic Monad RPC fallback if network conditions fluctuate.

### 6. 🔐 Privy Embedded MPC Wallet & Social Login
Users can log in seamlessly using **Google, Twitter, Email, or Passkeys** via Privy Embedded MPC Wallets, or connect external EVM wallets (MetaMask, Phantom, Coinbase Wallet).

---

## 🏛️ Smart Contract Architecture

```
                       ┌──────────────────────────────────────────┐
                       │           MonadBirthdayVault             │
                       │ 0xd3146Aabe8a4f50426d0d12A67ecca0ebEB06764 │
                       └────────────────────┬─────────────────────┘
                                            │
           ┌────────────────────────────────┼────────────────────────────────┐
           │                                │                                │
           ▼                                ▼                                ▼
┌─────────────────────┐          ┌──────────────────────┐        ┌──────────────────────┐
│  Monad Staking      │          │  MonadBirthdayNFT    │        │  Pyth Network Oracle │
│  Precompile (0x1000)│          │  (On-Chain SVG)      │        │  (HERMES Price Feed) │
└─────────────────────┘          └──────────────────────┘        └──────────────────────┘
```

### Core Functions

- `createVault(address _recipient, string _recipientName, uint256 _durationInDays, uint256 _targetAmount)`: Deploys a new time-locked birthday vault pool.
- `contribute(uint256 _vaultId, string _message)`: Accepts MON contribution + wish message, updates vault principal, and stakes into Monad Precompile `0x1000`.
- `releaseBirthdayGift(uint256 _vaultId, bool _isDemoMode)`: Unlocks the pool on or after the birthday (or instant demo time-travel mode), calculates total payout + yield, transfers MON to recipient, and mints the On-Chain SVG NFT Booklet.

---

## 🛠️ Project Structure

```
MonadWishes/
├── contracts/                  # Solidity Smart Contracts (Foundry)
│   ├── src/
│   │   ├── MonadBirthdayVault.sol  # Main Time-Locked Vault & Yield Pool
│   │   └── MonadBirthdayNFT.sol    # Dynamic On-Chain SVG NFT Booklet
│   ├── script/
│   │   └── Deploy.s.sol            # Monad Testnet Deployment Script
│   └── test/
│       └── MonadBirthdayVault.t.sol# Comprehensive Foundry Test Suite
├── indexer/                    # Envio HyperIndex GraphQL Indexer
│   ├── config.yaml             # Envio Monad Testnet Event Schema
│   └── schema.graphql          # Vault & Greeting Data Entities
├── frontend/                   # React + Vite Web Application
│   ├── src/
│   │   ├── components/         # Neo-Brutalist UI Components & Modals
│   │   ├── config/monad.ts     # Monad Testnet Chain & Contract ABIs
│   │   ├── hooks/
│   │   │   ├── useVaultClient.ts# Unified Web3 & Vault Transaction Client
│   │   │   └── usePythPrice.ts  # Pyth Live MON/USD Price Hook
│   │   ├── routes/index.tsx    # App Dashboard & Vault Feed
│   │   └── services/indexer.ts # Envio GraphQL & RPC Fallback Client
└── README.md
```

---

## ⚡ Local Setup & Development

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Bun](https://bun.sh/) or `npm` / `pnpm`
- [Foundry](https://getfoundry.sh/) (for smart contract testing & deployment)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/harkon666/MonadWishes.git
cd MonadWishes/frontend
bun install
```

### 2. Configure Environment Variables

Create `.env.local` inside `frontend/`:

```env
VITE_PRIVY_APP_ID=cmsjz9g5v007a0el4gkpcvptt
VITE_VAULT_ADDRESS=0xd3146Aabe8a4f50426d0d12A67ecca0ebEB06764
VITE_NFT_ADDRESS=0x80994d808075041964605fCA72E7858b861c2c01
VITE_INDEXER_GRAPHQL_URL=https://indexer.dev.hyperindex.xyz/d13d863/v1/graphql
```

### 3. Run Frontend Locally

```bash
bun dev
```

Open `http://localhost:3000` in your browser.

---

## 🧪 Smart Contract Verification & Testing (Foundry)

Run the full Foundry unit test suite against Monad Testnet configurations:

```bash
cd contracts
forge test -vvv
```

### Deploying to Monad Testnet

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://testnet-rpc.monad.xyz \
  --broadcast \
  --legacy
```

---

## 🎯 Hackathon Highlights

- **Built For Monad**: Built from the ground up for Monad's EVM execution engine, leveraging native precompiles and 0.3s block speed.
- **Real Use Case**: Solves group birthday gifting by combining pool funding, yield generation, social greetings, and collectible digital memories.
- **Production Ready**: Fully deployed live on Monad Testnet and Vercel with automated Envio GraphQL indexing.

---

## 📄 License

MIT License © 2026 MonadWishes Team
