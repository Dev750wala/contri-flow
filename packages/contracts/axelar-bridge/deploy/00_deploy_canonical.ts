import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  const name = process.env.TOKEN_NAME || 'Canonical Token';
  const symbol = process.env.TOKEN_SYMBOL || 'TOKEN';
  const gateway = process.env.SEPOLIA_GATEWAY as string;

  const factory = await ethers.getContractFactory('CanonicalToken');
  const impl = await factory.deploy();
  await impl.waitForDeployment();

  const canon = await ethers.getContractAt(
    'CanonicalToken',
    await impl.getAddress()
  );
  const tx = await (canon as any).initialize(
    name,
    symbol,
    await deployer.getAddress(),
    gateway
  );
  await tx.wait();

  console.log('CanonicalToken deployed at', await impl.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
