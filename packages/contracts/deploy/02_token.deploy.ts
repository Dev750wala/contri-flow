import 'hardhat-deploy';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, networkConfig } from '../helpers';
import { network } from 'hardhat';
import { verify } from '../utils/verify';
import { bondingCurveTokenSol } from '../typechain-types/factories/contracts';

module.exports = async (hre: HardhatRuntimeEnvironment) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;

  const { deployer } = await getNamedAccounts();

  const BondingCurveToken = await deploy("BondingCurveToken", {
    from: deployer,
    log: true,
    waitConfirmations: 3,
    contract: "DevToken",
  });

  console.log(BondingCurveToken);
  

  if (!developmentChains.includes(network.name)) {
    console.log('Trying to verify the contract on Etherscan...');

    await verify(BondingCurveToken.address, []);
  }
};

module.exports.tags = ['all', 'bondingcurvetoken'];
