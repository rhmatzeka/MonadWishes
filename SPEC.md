# MonadWishes Engineering Specification (SPEC.md)

## Problem Statement

When friend groups organize birthday gift pools 1 month prior to the event, conventional Web2 and traditional Web1/Web3 solutions introduce major pain points:
1. **Idle Funds & Lost Yield**: Pooled funds sit idle for 30 days without generating any interest or growth.
2. **Prohibitive Gas Fees**: High transaction fees on traditional L1/L2 networks prevent micro-contributions ($0.50 – $2.00) from large networks of friends.
3. **Manual & Unreliable Disbursal**: Admins must manually remember and execute transfers at 00:00 on the recipient's birthday.
4. **Lack of Emotional Memorabilia**: Monetary transfers offer no lasting emotional keepsake or consolidated group greeting record.
5. **Web3 Onboarding Friction**: Non-crypto native friends struggle with wallet creation, seed phrases, and network configuration.
6. **Slow Event Data Indexing**: Polling blockchain nodes directly causes sluggish UI loading for greeting feeds and active vault dashboards.

---

## Solution

**MonadWishes** is a Social Birthday Gift Vault & Micro-Yield Pool built specifically for the **Monad Blockchain**:
- **Time-Locked Gift Vaults**: Pools locked until the target birthday timestamp (e.g. 30 days).
- **Yield Bonus**: 0.5% per 30 days, counted up to the birthday and paid from a protocol reserve. Real delegation to Monad staking (`0x1000`) is not built; the old call used a wrong selector and was removed.
- **Sub-Second Micro-Contributions & Greeting Feed**: 300ms–400ms block times and sub-cent gas fees ($0.001) allow real-time micro-donations and on-chain messages.
- **Envio HyperIndex GraphQL Engine**: Sub-second event indexing for `VaultCreated`, `ContributionReceived`, and `GiftClaimed` with automatic viem RPC `readContract` fallback.
- **Dynamic On-Chain SVG Memory Booklet NFT**: Upon claim, recipients receive a 100% on-chain SVG NFT containing gift stats, total yield, and greeting records.
- **Enforced Network Switching (Chain ID 10143)**: Auto-detects wallet network mismatch and displays a 1-click "Switch to Monad Testnet" UI banner.
- **Live Sub-Second Yield Ticker**: Real-time animated counter visualizing prorated yield growth every second to highlight Monad's high-frequency throughput.
- **Frictionless Web2.5 UX (Privy SDK / EIP-7702)**: Social login (Google/Twitter) with paymaster gasless sponsorship.
- **Live Fiat Pricing (Pyth Network Oracle)**: MON target amounts mapped dynamically to USD using Pyth Hermes off-chain price feeds.
- **Hackathon Demo Mode**: 1-click time-travel simulation allowing judges to experience the instant 00:00 payout in 3-minute pitch presentations.

---

## User Stories

1. As a vault creator, I want to create a time-locked birthday gift pool for my friend by providing their name, wallet/social handle, target duration in days, and MON target amount, so that our friend group can start pooling funds immediately.
2. As a contributor, I want to log in using my Google or Twitter account without installing a browser wallet, so that I can participate without Web3 technical barriers.
3. As a user whose wallet is connected to Sepolia or Ethereum Mainnet, I want an explicit warning banner with a 1-click "Switch to Monad Testnet" button, so that my transaction never fails due to network mismatch.
4. As a contributor, I want to send micro-contributions (e.g. 0.1 MON or $1.00) without paying gas fees, so that my entire contribution goes directly to my friend's gift pool.
5. As a contributor, I want to leave a personalized on-chain birthday message with my contribution, so that it is permanently recorded for my friend to read.
6. As a group member, I want active vaults and greeting feeds loaded instantly via Envio HyperIndex GraphQL API with fallback to RPC node, so that the dashboard renders instantly without delay.
7. As a group member, I want to see the live sub-second yield ticker updating in real-time alongside Pyth USD pricing, so that I can watch our yield accumulate live.
8. As a recipient, I want funds (principal + accumulated DeFi yield) automatically unlocked on my birthday timestamp, so that I receive my gift immediately at midnight without needing an admin to manually send it.
9. As a recipient, I want to view my 100% on-chain Dynamic SVG NFT Memory Booklet in an interactive modal, so that I can admire all messages and contributor stats.
10. As a hackathon judge, I want a dedicated "⚡ Demo Time Travel Release" button on the UI, so that I can trigger and verify the time-lock release and NFT minting instantly within a 3-minute pitch presentation.

---

## Implementation Decisions

### Core Architecture & Modules
- **Smart Contract Layer (`contracts/src/`)**:
  - `MonadBirthdayVault.sol`: Address `0x24d1C9A1424CeEF852Dfcb65c59726a870e635B8`. Manages vault lifecycle, greeting storage, the yield reserve and yield calculation (`calculateYieldBonus`).
  - `MonadBirthdayNFT.sol`: Address `0xC69aE4138DBc33389B1b25130f68E91b2A0169B8`. Dynamic base64-encoded on-chain SVG booklet artwork.
- **Indexer Layer (`indexer/`)**:
  - Envio HyperIndex indexing `VaultCreated`, `ContributionReceived`, and `GiftClaimed` events on Monad Testnet (`10143`).
  - Schema entities: `VaultEntity`, `ContributionEntity`, `GiftClaimEntity`.
- **Frontend Layer (`frontend/src/`)**:
  - React + TanStack Router + Tailwind CSS.
  - Viem configured for Monad Testnet (`Chain ID 10143`, RPC `https://testnet-rpc.monad.xyz`).
  - `services/indexer.ts`: Service querying Envio GraphQL with automatic fallback to viem `publicClient.readContract`.
  - `components/PrivyBridge.tsx`: Lazy-loaded Privy layer. It loads on login or for a returning session, switches the wallet to Monad Testnet and refuses to send on any other chain.
  - `components/VaultDetailsModal.tsx`: Includes Live Sub-Second Yield Ticker component and Interactive Memory NFT Booklet modal.
  - Privy SDK for EIP-7702 Social Login & Account Abstraction Gasless Paymaster.
  - Pyth contract on Monad Testnet for the MON/USD price (the public Hermes API now needs a key).

### Key Technical & Architectural Decisions (ADR Summary)
- **ADR-001 (Optional Indexer, Multicall by Default)**: Envio GraphQL is used only when `VITE_INDEXER_GRAPHQL_URL` is set. Otherwise, or for 5 minutes after a failure, the frontend reads all vaults with viem `multicall`.
- **ADR-002 (Protocol Reserve Yield Pool & Ticker)**: Vault contract includes `receive() external payable` for reserve funding. UI calculates sub-second live yield growth per second.
- **ADR-003 (Network Auto-Switching UI)**: Prompt user when connected wallet chainId != `10143` to avoid `ContractFunctionExecutionError`.
- **ADR-004 (Memory NFT Viewer & Dual Claim Mode)**: Render SVG booklet inline via `tokenURI(tokenId)` and provide both Real Time-Lock & Demo Time Travel release triggers.
- **ADR-005 (Indexer Config Sync)**: `indexer/config.yaml` synced to Vault contract `0x24d1C9A1424CeEF852Dfcb65c59726a870e635B8`.
- **ADR-006 (Sub-Second Live Yield Counter)**: Live ticker animation updated every 1000ms in frontend UI.
- **ADR-007 (Deep Unified MonadVaultClient Module)**: Encapsulate reads, writes, dual-source fallback, and automated refetching into a unified `useVaultClient` hook interface.


---

## Testing Decisions

### Seams Strategy
1. **Contract Seam (Foundry Integration Suite)**:
   - File: `contracts/test/MonadBirthdayVault.t.sol`.
   - Validates `createVault`, `contribute`, `calculateYieldBonus`, `releaseBirthdayGift` (both Demo and Time Travel mode), and SVG NFT `tokenURI` output.

2. **Indexer Seam (Envio Local Testing)**:
   - Validates event parsing for `VaultCreated`, `ContributionReceived`, `GiftClaimed`.

3. **Frontend Integration Seam (Vite / React Testing)**:
   - Tests `indexer.ts` GraphQL fetch with simulated fallback to viem `readContract`.
   - Tests `ensureMonadNetwork()` chain ID validation and network switch triggers.

---

## Out of Scope

- Multi-token ERC20 vault funding (USDC/USDT) — MVP focuses strictly on MON native asset.
- Mainnet production deployment (targeting Monad Testnet Chain ID 10143).

---

## Further Notes

- **Pitch Checklist (3-Minute Presentation)**:
  1. UX Layer: Privy Embedded Social Login + Network Auto-Switch Banner.
  2. Indexer Layer: Envio HyperIndex Sub-second Monad Event Indexing & Viem Fallback.
  3. Smart Contract Layer: Yield Reserve Pool + Dynamic SVG NFT.
  4. Execution Layer: High-Frequency Sub-Second Live Yield Counter Ticker (0.3s Monad block time).
