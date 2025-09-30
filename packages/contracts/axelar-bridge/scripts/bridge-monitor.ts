import 'dotenv/config';
import { ethers } from 'ethers';
import fs from 'fs';

async function checkInvariant() {
  const sepoliaProvider = new ethers.JsonRpcProvider(
    process.env.RPC_SEPOLIA as string
  );
  const baseProvider = new ethers.JsonRpcProvider(
    process.env.RPC_BASE_SEPOLIA as string
  );

  const canonical = new ethers.Contract(
    process.env.SEPOLIA_CANONICAL_TOKEN as string,
    ['function balanceOf(address) view returns (uint256)'],
    sepoliaProvider
  );

  const wrapped = new ethers.Contract(
    process.env.BASE_WRAPPED_TOKEN as string,
    ['function totalSupply() view returns (uint256)'],
    baseProvider
  );

  const gatewayAddress = process.env.SEPOLIA_GATEWAY as string;

  const locked = await canonical.balanceOf(gatewayAddress);
  const wrappedSupply = await wrapped.totalSupply();

  const lockedStr = locked.toString();
  const supplyStr = wrappedSupply.toString();

  const diff =
    BigInt(locked) > BigInt(wrappedSupply)
      ? BigInt(locked) - BigInt(wrappedSupply)
      : BigInt(wrappedSupply) - BigInt(locked);
  const thresholdBps = 1n; // 0.01% = 1 bps
  const threshold = (BigInt(wrappedSupply) * thresholdBps) / 10000n;
  const ok = diff <= threshold;

  const log = {
    time: new Date().toISOString(),
    locked: lockedStr,
    wrappedSupply: supplyStr,
    ok,
    diff: diff.toString(),
  };

  fs.mkdirSync('logs', { recursive: true });
  fs.appendFileSync('logs/monitor.jsonl', JSON.stringify(log) + '\n');

  if (!ok) {
    console.error('ALERT: Supply invariant mismatch', log);
  } else {
    console.log('Invariant OK', log);
  }
}

async function main() {
  await checkInvariant();
  setInterval(checkInvariant, 5 * 60 * 1000);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
