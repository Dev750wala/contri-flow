import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  const name = process.env.TOKEN_NAME || 'Wrapped Token';
  const symbol = process.env.TOKEN_SYMBOL || 'TOKEN';
  const gateway = process.env.BASE_GATEWAY as string;

  const factory = await ethers.getContractFactory('WrappedInterchainToken');
  const impl = await factory.deploy();
  await impl.waitForDeployment();

  const wrapped = await ethers.getContractAt(
    'WrappedInterchainToken',
    await impl.getAddress()
  );
  const tx = await (wrapped as any).initialize(
    name,
    symbol,
    await deployer.getAddress(),
    gateway
  );
  await tx.wait();

  console.log('WrappedInterchainToken deployed at', await impl.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
