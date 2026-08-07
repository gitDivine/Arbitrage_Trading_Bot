# 0xd Bot Factory — PROJECT BRAIN
**Last Updated:** March 2026
**Wallet:** `0x863D20694E1E74A96a149fA21BeFe13FbBF529c6`
**VPS Primary:** `clicker-1` | IP: `145.241.96.149` | Ubuntu 22.04 (Oracle Cloud Free Tier)
**VPS Backup:** `instance-20260305-0622` | IP: `129.151.172.71`
**SSH Key:** `~/ssh-key-2026-03-05.key`

---

## System Architecture

Three repos, one wallet, one Oracle VM, one Telegram manager:

| Repo | Local | Remote | Purpose |
|------|-------|--------|---------|
| `base-arb-bot` | `C:\Users\njoku\Downloads\base-arb-bot` | `gitDivine/base-arb-bot` | Flash loan arbitrage — Base + Arbitrum |
| `aave-liquidation-bot` | `C:\Users\njoku\liquidation-bot\liquidation-bot` | `gitDivine/aave-liquidation-bot` | Flash loan liquidation — Base + Arbitrum |
| `bots-manager` | `C:\Users\njoku\bots-manager` | `gitDivine/bots-manager` | Telegram control centre |

---

## Deployed Contracts

| Chain | Bot | Contract Address |
|-------|-----|-----------------|
| Base | ArbBot.sol | `0xbbFc8Bf808A0D1b964048B87c0787e03c97Cc341` |
| Base | LiquidationBot.sol | `0xbfB83FD70B149DEF53591f50762Ed31c56Cb849E` |
| Arbitrum | ArbBot.sol | `0x1d1D09a9f891B3E0C62f5C1A3a6dC6DA7E4FE197` ✅ (owner verified) |
| Arbitrum | LiquidationBot.sol | *(check `CONTRACT_ADDRESS` env on VPS)* |

---

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| P0–P8 | Rescue, Base Live, Multi-chain, Manager, Hardening | ✅ DONE |
| P9 | Multi-chain bots-manager | ✅ DONE |
| P10 | Production Hardening | ✅ DONE |
| P11 | Scaling Hunter (15+ tokens, Multicall3) | ✅ DONE |
| P12 | Sniper Mode (staticCall simulation) + Surface Expansion | ✅ DONE |
| P13 | Parallel Dynamic Size Optimizer + Whale Fix | ✅ DONE |
| **P14** | **Arbitrum ArbBot.sol deploy + debug** | ✅ DONE (deployed, config fixed, watchlist expanded) |

---

## Current State (March 2026)

### base-arb-bot (Phase 13 complete)
- **Base:** Running, healthy. Monitoring AERO, WELL, cbBTC, VIRTUAL, MOXIE, MAGA.
- **Arbitrum:** Monitoring RDNT, PENDLE, WBTC, LINK, DAI, UNI, FRAX, LDO, GNS, CRV, DEGEN — 12 pairs across Uniswap V3, Camelot V3, Ramses.
- **FIXED (2026-03-27):** Contract address hardcoded, WS URL fixed, Ramses factory corrected, Camelot poolByPair fixed, stale ABI replaced, fee tier caching added, watchlist expanded to 9 pools (ARB, WBTC-USDC, GMX-USDC, DAI + Camelot pairs).

### aave-liquidation-bot (Phase 12 complete)
- **Base:** Running, 193+ positions watched.
- **Arbitrum:** Running, 120+ positions discovered. Branch tracked = `master` (GitHub uses `main` — auto-update will silently fail).
- **Bug:** `autoUpdate()` uses `const branch = 'master'` but remote is `main`. Fix: change to `'main'`.

### bots-manager
- Running under Systemd. Multi-chain aware. Latest commit adds Arbitrum bot instances.

---

## Known Issues (Active)

### RESOLVED (2026-03-27)
- ~~Arbitrum ArbBot.sol not deployed~~ → deployed at `0x1d1D09a9f891B3E0C62f5C1A3a6dC6DA7E4FE197`, config hardcoded
- ~~Stale ARB_BOT_ABI in scanner.ts~~ → replaced with correct startArbitrage signature
- ~~Camelot poolByPair not called~~ → ALGEBRA type now branches to poolByPair
- ~~Ramses wrong factory address~~ → corrected to `0xd0019e86edB35E1fedaaB03aED5c3c60f115d28b`
- ~~Fee tier mismatch in quotes~~ → feeCache stores actual discovered fee
- ~~Liquidation bot variableDebtTokenAddress crash~~ → ethers v6 auto-unwrap fix
- ~~bots-manager RPC_URL crash~~ → dead code removed
- ~~Silent WS death~~ → 30s polling fallback added (2026-03-28)
- ~~Base Multicall3 `CALL_EXCEPTION`~~ → Fixed incorrect Base UniswapV3 QuoterV2 address (was pointing to BSC PancakeSwap QuoterV2).

### HIGH
1. **Log duplication x5** — Multiple WS event listeners stacking on reconnect. Needs investigation.
2. **Ramses V3 quoter routing** — Ramses on Arbitrum routed to UniV3 QuoterV2. Ramses has its own quoter. May produce incorrect quotes.
3. **Base arb gaps below threshold** — AERO gaps tight. Consider more volatile pairs or lower flash amounts.

### MEDIUM
4. **QuoterV2 for Camelot** — Camelot V3 (Algebra) may need Algebra-specific quoter, not UniV3 QuoterV2.
5. **No profit sweep** — Contract profits accumulate without auto-sweep to wallet.
6. **Liquidation bot auto-update branch** — Uses `master` but remote may be `main` on some repos.

---

## Whitepaper Roadmap (What Comes After P14)

| Phase | Bot | Chain | Notes |
|-------|-----|-------|-------|
| JIT Bot | JIT Liquidity | Arbitrum | Requires $200-500 USDC seed from bot profits. Public mempool only. |
| P15 | BSC Expansion | BSC | PancakeSwap vs BiSwap arb + Aave V3 liquidations |
| P16 | Polygon Expansion | Polygon | Uni V3 vs QuickSwap arb + Aave V3 liquidations |
| Long-term | Sandwich Defense Arb | All chains | MEV profits from sandwich detection |
| Long-term | GMX Yield Engine | Arbitrum | GLP pool passive yield from bot profits |
| Long-term | Aerodrome LP | Base | ve(3,3) passive yield from bot profits |

---

## Key Addresses

| Contract | Chain | Address |
|----------|-------|---------|
| Aave V3 Pool | Base | `0xA238Dd80C259a72e81d7e4664a9801593F98d1c5` |
| Aave V3 Pool | Arbitrum | `0x794a61358D6845594F94dc1DB02A252b5b4814aD` |
| Multicall3 | All chains | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| Uni V3 Factory | Base | `0x33128a8fC17869897dcE68Ed026d694621f6FDfD` |
| Uni V3 Factory | Arbitrum | `0x1F98431c8aD98523631AE4a59f267346ea31F984` |
| Aerodrome Factory | Base | `0x420DD381b31aEf6683db6B902084cB0FFECe40Da` |
| Camelot V3 Factory | Arbitrum | `0x1a3c9B1d2F0529D97f2afC5136Cc23e58f1FD35B` |
| Ramses V3 CL Factory | Arbitrum | `0xd0019e86edB35E1fedaaB03aED5c3c60f115d28b` |

---

## VPS Operations

```bash
# SSH
ssh -i ~/ssh-key-2026-03-05.key ubuntu@145.241.96.149

# Deploy update (all bots)
cd ~/base-arb-bot && git fetch origin && git reset --hard origin/main && npm install && npm start
cd ~/aave-liquidation-bot && git fetch origin && git reset --hard origin/main && npm install

# Logs
tail -f ~/base-arb-bot/arb.log
tail -f ~/aave-liquidation-bot/liq.log

# Set Arbitrum contract address (after deploy)
export CONTRACT_ADDRESS=<deployed_address>
# Or add to .env file
```

---

## Session Log

### Session: March 2026 — New Agent Onboarding
- Read all brain files, walkthrough docs (P1–P13), whitepaper, and live codebase
- Identified CRITICAL: Arbitrum ArbBot.sol not deployed (contractAddress empty)
- Identified: Liquidation bot auto-update on wrong branch (master vs main)
- Identified: Log duplication x5 in arb.log
- Created PROJECT_BRAIN.md
- **Next steps:**
  1. ~~Confirm what debugging the user is actively seeing on VPS~~ → Done
  2. ~~Deploy ArbBot.sol to Arbitrum~~ → Already deployed, address confirmed
  3. Fix liquidation bot branch bug
  4. Fix log duplication

### Session: 2026-03-27 — Claude Opus 4.6 Agent
**Done:**
1. Fixed 5 critical bugs in config.ts (contract address, WS URL, Ramses factory)
2. Fixed scanner.ts (stale ABI, Algebra poolByPair, Ramses factory ABI)
3. Expanded Arbitrum watchlist: 3 → 9 pools (ARB, WBTC-USDC, GMX-USDC, DAI with Camelot)
4. Added fee tier caching — fixes VIRTUAL and any fallback-fee-discovered pools
5. Fixed liquidation bot ethers v6 auto-unwrap crash (AaveV3Adapter.js)
6. Fixed bots-manager fatal RPC_URL crash (dead code in manager.js)
7. Set up agent directory structure (brain/, skills/, workflows/, memory/)
8. Created/updated PROJECT_BRAIN.md for all 3 repos

**Pending:**
- Verify VIRTUAL quotes on Base after fee cache fix
- Monitor Arbitrum for first gap detection
- Investigate log duplication x5 bug
- Consider Ramses-specific quoter

**Next:**
- User restarts bots on VPS, verify clean logs

### Session: 2026-03-28 — Claude Opus 4.6 Agent
**Done:**
1. Diagnosed root cause of 0 trades in 29h: WebSocket subscriptions silently dead on public RPCs
2. Added 30s polling fallback — refreshes all pool prices via HTTP regardless of WS state
3. Added WS health tracking (lastWsEvent timestamp, logged every ~2.5 min)
4. WS events still trigger instant updates when alive; polling ensures coverage when dead

**Pending:**
- Verify polling generates Ratio Gap lines after VPS auto-update
- Monitor for first successful trade execution

**Next:**
- VPS auto-pulls in ≤10 min — watch for Poll #N log lines and gap detections

### Session: 2026-07-25 / 2026-07-26 — Codex Agent
**Done:**
1. [2026-07-25] - [IMPORTANT] - Weekend Liquidity Optimization: Added 5% and 2.5% micro-trade flash loan sizes to `scanner.ts` and lowered `minProfitBps` to 2.0 bps to capture thin weekend liquidity. WHY: User requested scaling down trade sizes to monetize thin liquidity periods.
2. [2026-07-25] - [IMPORTANT] - Profit Consolidation & Sweep: Created `src/consolidate.ts` and added `/sweep` command to sweep accumulated contract profits across Base and Arbitrum to the owner wallet. WHY: Contract profits accumulated without an automated sweep mechanism.
3. [2026-07-26] - [CRITICAL] - Uniswap V3 QuoterV2 Precision Integration (v4 Issue 4): Refactored `batchGetQuotes` and `getOnChainQuote` in `scanner.ts` and updated `config.ts` to route quotes to specific Quoter contracts (`camelotV3Quoter`, `ramsesQuoter`, `uniswapV3QuoterV2`) with correct ABIs (`ALGEBRA_QUOTER_ABI` vs `UNI_V3_QUOTER_V2_ABI`). WHY: Hardcoded UniV3 QuoterV2 calls for Camelot and Ramses caused reverts and inaccurate quotes, resulting in near-miss trades (e.g. -$0.0124 AERO).
4. [2026-07-26] - [CRITICAL] - Fee Tier Discovery & Multi-Listener Stacking Fixes: In `scanner.ts`, updated fee discovery to check `pair.fee` (the configured canonical fee tier) first before falling back to `[500, 3000, 10000, 100]`. Added `removeAllListeners` cleanup in `setupPoolSubscription()` and `reconnect()` and deduplicated `poolMeta`. WHY: Scanner previously bound to empty 1bps dust pools for VIRTUAL, AERO, cbBTC, ARB, WBTC, GMX, causing Multicall out-of-gas reverts (`CALL_EXCEPTION`) and quote failures. Reconnecting without cleaning up old listeners caused 6+ identical listeners per pool, spamming RPCs with duplicate price fetches and triggering `429 Limit Exceeded`.

### Session: 2026-08-07 — Codex Agent
**Done:**
5. [2026-08-07] - [CRITICAL] - Low-Fee Pool & Volatile Mid-Cap Expansion (Fix 1 & 2): In `config.ts`, added 1bps fee tier virtual DEXes (`uniV3_100`), added high-volume 5bps (0.05%) and 1bps (0.01%) WETH/USDC, cbBTC, AERO, VIRTUAL, and ARB pools, and added high-liquidity (> $500k TVL) mid-cap tokens `BRETT` (Base) and `GRAIL` (Arbitrum). WHY: 30bps pool arbs require > 65bps raw gap to cover 60bps DEX swap fees + 5bps flash loan fee. 5bps/1bps pools reduce swap friction to 10-15bps, making 25-30bps raw price gaps immediately net-profitable!
6. [2026-08-07] - [CRITICAL] - Case-Insensitive Quoter Matching & Resilient Quote Fallback: Fixed case-sensitivity for `v3` / `uniswap` virtual DEX names in `batchGetQuotes()` and `getOnChainQuote()`. Added `Promise.all` fallback to query quotes individually when batched Multicall staticCall encounters RPC-level revert exceptions on thin/uninitialized pools. WHY: RPC nodes (e.g., Base public nodes) return empty `0x` revert buffers when a single QuoterV2 call inside `tryAggregate` reverts, failing the entire Multicall batch. Individual fallback ensures valid pool quotes succeed cleanly.
7. [2026-08-07] - [CRITICAL] - Aerodrome Slipstream (CL) Integration: Added Aerodrome Slipstream Concentrated Liquidity (`slipstreamRouter` / `slipstreamFactory`) and cross-DEX surfaces `UniV3_Slipstream_USDC` & `UniV3_Slipstream_WETH` in `config.ts`. WHY: Standard Aerodrome V2 uses 30bps fee for volatile pairs (WETH/USDC). Slipstream CL pools use 1bps/5bps fee tiers, bringing cross-DEX friction down from 40bps to 15bps (5bps Slipstream + 5bps UniV3 + 5bps Aave), making 40bps+ raw gaps immediately net-profitable!

---

## Latest Summary
- **Current Focus:** Monitoring Aerodrome Slipstream CL 1bps/5bps & Uniswap V3 low-fee arbitrage opportunities.
- **Last Action Taken:** Added Aerodrome Slipstream CL router/factory and cross-DEX surfaces (`UniV3_Slipstream_*`) in `config.ts`. Compiled cleanly and pushed to `origin/main` (`33a16ef`).
- **Next Steps:** User pulls latest update on VPS (`git pull origin main && npm run build && npm start`) to monitor net-positive Slipstream vs UniV3 arbitrage execution.
