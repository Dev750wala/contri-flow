import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  const gateway = process.env.BASE_GATEWAY as string;
  const gasService = process.env.BASE_GAS_SERVICE as string;
  const rewardToken = process.env.BASE_WRAPPED_TOKEN as string;

  const factory = await ethers.getContractFactory('RewardManager');
  const contract = await factory.deploy(
    gateway,
    gasService,
    await deployer.getAddress(),
    rewardToken
  );
  await contract.waitForDeployment();
  console.log('RewardManager deployed at', await contract.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
