import 'dotenv/config';
import {
  AxelarQueryAPI,
  Environment,
  EvmChain,
  GasToken,
} from '@axelar-network/axelarjs-sdk';
import { ethers } from 'ethers';
import fs from 'fs';

async function main() {
  const rpc = process.env.RPC_SEPOLIA as string;
  const privateKey = process.env.PRIVATE_KEY as string;
  const tokenAddress = process.env.SEPOLIA_CANONICAL_TOKEN as string;
  const gatewayAddress = process.env.SEPOLIA_GATEWAY as string;
  const amountStr = process.env.BRIDGE_AMOUNT as string;
  const destChain = (process.env.DEST_CHAIN || 'base-sepolia') as string;
  const destAddress = process.env.DEST_ADDRESS as string;

  if (
    !rpc ||
    !privateKey ||
    !tokenAddress ||
    !gatewayAddress ||
    !amountStr ||
    !destAddress
  ) {
    throw new Error('Missing required env vars');
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(privateKey, provider);

  const erc20Abi = [
    'function approve(address spender, uint256 value) external returns (bool)',
    'function allowance(address owner, address spender) external view returns (uint256)',
  ];
  const token = new ethers.Contract(tokenAddress, erc20Abi, wallet);

  const amount = BigInt(amountStr);

  const allowance: bigint = await token.allowance(
    await wallet.getAddress(),
    gatewayAddress
  );
  if (allowance < amount) {
    const tx = await token.approve(gatewayAddress, amount);
    console.log('Approve tx:', tx.hash);
    await tx.wait();
  }

  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });
  const gas = await api.estimateGasFee(
    EvmChain.SEPOLIA,
    EvmChain.BASE_SEPOLIA,
    700000, // gas limit buffer
    GasToken.ETH
  );

  const gatewayAbi = [
    'function sendToken(string calldata destinationChain, string calldata destinationAddress, string calldata symbol, uint256 amount) external',
  ];
  const gateway = new ethers.Contract(gatewayAddress, gatewayAbi, wallet);

  const symbol = process.env.TOKEN_SYMBOL || 'TOKEN';

  const feeWei = BigInt(Math.ceil(Number(gas)));

  const tx = await gateway.sendToken(destChain, destAddress, symbol, amount, {
    value: feeWei,
  });
  console.log('sendToken tx:', tx.hash);

  const log = {
    time: new Date().toISOString(),
    txHash: tx.hash,
    axelarscan: `https://testnet.axelarscan.io/gmp/${tx.hash}`,
    amount: amount.toString(),
    destChain,
    destAddress,
  };

  fs.mkdirSync('logs', { recursive: true });
  fs.appendFileSync('logs/prebridge.jsonl', JSON.stringify(log) + '\n');

  console.log('Axelarscan URL:', log.axelarscan);
}

main().catch((err) => {
  console.error('prebridge error:', err);
  process.exit(1);
});
