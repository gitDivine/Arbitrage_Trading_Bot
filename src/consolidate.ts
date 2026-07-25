import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { CONFIG } from './config';

dotenv.config();

// Default thresholds before triggering a sweep
const MIN_ETH_TO_SWEEP = ethers.parseEther('0.05'); // 0.05 ETH minimum
const MIN_USDC_TO_SWEEP = ethers.parseUnits('50', 6); // 50 USDC minimum

const COLD_WALLET = process.env.COLD_WALLET;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
    console.error('❌ PRIVATE_KEY is not set in .env');
    process.exit(1);
}

if (!COLD_WALLET) {
    console.warn('⚠️ COLD_WALLET is not set in .env. Running in monitoring mode only.');
}

// RPCs
const baseProvider = new ethers.JsonRpcProvider(process.env.BASE_HTTP_URL || 'https://mainnet.base.org');
const arbProvider = new ethers.JsonRpcProvider(process.env.ARB_HTTP_URL || 'https://arb1.arbitrum.io/rpc');

const baseWallet = new ethers.Wallet(PRIVATE_KEY, baseProvider);
const arbWallet = new ethers.Wallet(PRIVATE_KEY, arbProvider);

// Minimal ERC20 ABI for balance/transfer
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function decimals() view returns (uint8)'
];

const usdcBase = new ethers.Contract('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', ERC20_ABI, baseWallet);
const usdcArb = new ethers.Contract('0xaf88d065e77c8cC2239327C5EDb3A432268e5831', ERC20_ABI, arbWallet);

async function checkAndSweep(
    wallet: ethers.Wallet, 
    chainName: string, 
    tokenContract: ethers.Contract, 
    tokenName: string, 
    minSweep: bigint, 
    isNative: boolean = false
) {
    try {
        let balance: bigint;
        let decimals = 18;

        if (isNative) {
            balance = await wallet.provider!.getBalance(wallet.address);
        } else {
            balance = await tokenContract.balanceOf(wallet.address);
            decimals = await tokenContract.decimals();
        }

        const balanceFmt = ethers.formatUnits(balance, decimals);
        console.log(`[${chainName}] ${tokenName} Balance: ${balanceFmt}`);

        if (balance > minSweep) {
            if (!COLD_WALLET) {
                console.log(`[${chainName}] 🔔 Threshold met for ${tokenName} (${balanceFmt}), but no COLD_WALLET configured to sweep.`);
                return;
            }

            // Reserve some gas if sweeping native ETH (0.005 ETH buffer)
            const sweepAmount = isNative ? balance - ethers.parseEther('0.005') : balance;
            
            if (sweepAmount <= 0n) return;

            console.log(`[${chainName}] 🧹 Sweeping ${ethers.formatUnits(sweepAmount, decimals)} ${tokenName} to ${COLD_WALLET}...`);
            
            let tx;
            if (isNative) {
                tx = await wallet.sendTransaction({
                    to: COLD_WALLET,
                    value: sweepAmount
                });
            } else {
                tx = await tokenContract.transfer(COLD_WALLET, sweepAmount);
            }
            
            console.log(`[${chainName}] ✅ Sweep TX sent: ${tx.hash}`);
            await tx.wait();
            console.log(`[${chainName}] 🚀 Sweep confirmed!`);
        }
    } catch (e: any) {
        console.error(`[${chainName}] Error checking/sweeping ${tokenName}:`, e.message);
    }
}

async function main() {
    console.log(`\n🔍 Starting Cross-Chain Consolidation Check`);
    console.log(`Master Wallet: ${baseWallet.address}`);
    console.log(`Cold Wallet: ${COLD_WALLET || 'NOT SET (Monitoring Only)'}`);
    console.log(`--------------------------------------------------`);

    // 1. Check Base Balances
    await checkAndSweep(baseWallet, 'Base', usdcBase, 'ETH', MIN_ETH_TO_SWEEP, true);
    await checkAndSweep(baseWallet, 'Base', usdcBase, 'USDC', MIN_USDC_TO_SWEEP, false);

    console.log(`--------------------------------------------------`);

    // 2. Check Arbitrum Balances
    await checkAndSweep(arbWallet, 'Arbitrum', usdcArb, 'ETH', MIN_ETH_TO_SWEEP, true);
    await checkAndSweep(arbWallet, 'Arbitrum', usdcArb, 'USDC', MIN_USDC_TO_SWEEP, false);

    console.log(`\n🏁 Consolidation check complete.\n`);
}

main().catch(console.error);
