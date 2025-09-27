import hre from 'hardhat';
import crypto from 'crypto';
import {
  AxelarQueryAPI,
  CHAINS,
  Environment,
  EvmChain,
  GasToken,
} from '@axelar-network/axelarjs-sdk';
import interchainTokenServiceContractABI from '../utils/interchainTokenServiceABI.json';
import interchainTokenFactoryContractABI from '../utils/interchainTokenFactoryABI.json';
import interchainTokenContractABI from '../utils/interchainTokenABI.json';
import { InterfaceAbi } from 'ethers';

const interchainTokenServiceContractAddress =
  '0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C';
const interchainTokenFactoryContractAddress =
  '0x83a93500d23Fbc3e82B410aD07A6a9F7A0670D66';

async function getSigner() {
  const [deployer] = await hre.ethers.getSigners();
  return deployer;
}

async function getContractInstance(
  contractAddress: string,
  contractABI: InterfaceAbi,
  signer: any
) {
  return new hre.ethers.Contract(contractAddress, contractABI, signer);
}

async function registerAndDeploy() {
  const salt = '0x' + crypto.randomBytes(32).toString('hex');

  const name = 'MergePay Token';
  const symbol = 'MPT';
  const decimals = 18;

  const initialSupply = hre.ethers.parseEther('1000');

  const signer = await getSigner();

  const interchainTokenFactoryContract = await getContractInstance(
    interchainTokenFactoryContractAddress,
    interchainTokenFactoryContractABI,
    signer
  );
  const interchainTokenServiceContract = await getContractInstance(
    interchainTokenServiceContractAddress,
    interchainTokenServiceContractABI,
    signer
  );

  const tokenId = await interchainTokenFactoryContract.interchainTokenId(
    signer.address,
    salt
  );

  const tokenAddress =
    await interchainTokenServiceContract.interchainTokenAddress(tokenId);

  const expectedTokenManagerAddress =
    await interchainTokenServiceContract.tokenManagerAddress(tokenId);

  const deployTxData =
    await interchainTokenFactoryContract.deployInterchainToken(
      salt,
      name,
      symbol,
      decimals,
      initialSupply,
      signer.address
    );

  console.log(
    `
        Deployed Token ID: ${tokenId},
        Token Address: ${tokenAddress},
        Transaction Hash: ${deployTxData.hash},
        salt: ${salt},
        Expected Token Manager Address: ${expectedTokenManagerAddress},
        Deployer Address: ${signer.address}
     `
  );
}

async function gasEstimator() {
  const api = new AxelarQueryAPI({ environment: Environment.TESTNET });

  const gas = await api.estimateGasFee(
    EvmChain.SEPOLIA,
    CHAINS.TESTNET.POLYGON,
    GasToken.ETH,
    700000,
    1.1
  );

  return gas;
}

async function deployToRemoteChain(destinationChain: string) {
    const signer = await getSigner();
  
    const interchainTokenFactoryContract = await getContractInstance(
      interchainTokenFactoryContractAddress,
      interchainTokenFactoryContractABI,
      signer
    );
  
    const gasAmount = await gasEstimator();
  
    const salt =
      '0x3ae61937aab228dfbdc1f77bd5f983396c2301b45483e3e31bb8a6abf8fe3545';
  
    const txn = await interchainTokenFactoryContract[
      'deployRemoteInterchainToken(bytes32,string,uint256)'
    ](salt, destinationChain, gasAmount, { value: gasAmount });

    console.log(`Transaction Hash: ${txn.hash}`);
    console.log(`Full Transaction Data: ${JSON.stringify(txn, null, 2)}`);
  }

async function main() {
  const functionName = process.env.FUNCTION_NAME;
  switch (functionName) {

    case 'registerAndDeploy':
      await registerAndDeploy();
      break;

    case 'deployToRemoteChain':
      const destinationChain = process.env.DESTINATION_CHAIN;
      if (!destinationChain) {
        console.error('Destination chain is not set');
        process.exitCode = 1;
        return;
      }
      await deployToRemoteChain(destinationChain);
      break;

    default:
      console.error(`Unknown function: ${functionName}`);
      process.exitCode = 1;
      return;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Deployed Token ID: 0x5b28793d6ddc2d161f8c7078933758d730076e5d43522d2d10b3bd2f28e9832b,
// Token Address: 0xa62fCE379F63E7f4cA1dcDEe355Cb21e9FbA8775,
// Transaction Hash: 0xd1bdc9ccfe301174e286ba229537ec8eaae53d9e4617d5b7b13d8233af34b1bf,
// salt: 0x3ae61937aab228dfbdc1f77bd5f983396c2301b45483e3e31bb8a6abf8fe3545,
// Expected Token Manager Address: 0x34Ba1Ffa531987dF82ed0Ad58E4B8b5c4A3eC60b,
// Deployer Address: 0x81f99A1397B8f60Aa2B75753ad2BF39F298b8b87


// deployed to base-sepolia
// Transaction Hash: 0xa27ea809706142740ee46018112a6687a58b4a5d82e0a65ad480327e5fcb77f1

