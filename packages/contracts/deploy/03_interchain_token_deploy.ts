// import hre from 'hardhat';
// import crypto from 'crypto';
// import { AxelarQueryAPI, Environment, EvmChain, GasToken } from "@axelar-network/axelarjs-sdk";
// import * as interchainTokenServiceContractABI from "../utils/interchainTokenServiceABI.json"
// import * as interchainTokenFactoryContractABI from "../utils/interchainTokenFactoryABI.json"
// import * as interchainTokenContractABI from "../utils/interchainTokenABI.json"
// import { InterfaceAbi } from 'ethers';

// const interchainTokenServiceContractAddress = "0xB5FB4BE02232B1bBA4dC8f81dc24C26980dE9e3C";
// const interchainTokenFactoryContractAddress = "0x83a93500d23Fbc3e82B410aD07A6a9F7A0670D66";


// async function getSigner() {
//     const [deployer] = await hre.ethers.getSigners();
//     return deployer;
// }

// async function getContractInstance(contractAddress: string, contractABI: InterfaceAbi, signer: any) {
//     return new hre.ethers.Contract(contractAddress, contractABI, signer);
// }

// async function registerAndDeploy() {
//     const salt = "0x" + crypto.randomBytes(32).toString("hex");

//     const name = "MergePay Token";
//     const symbol = "MPT";
//     const decimals = 18;

//     const initialSupply = hre.ethers.parseEther("1000");

//     const signer = await getSigner();

//     const interchainTokenFactoryContract = await getContractInstance(
//         interchainTokenFactoryContractAddress,
//         interchainTokenFactoryContractABI,
//         signer,
//     );
//     const interchainTokenServiceContract = await getContractInstance(
//         interchainTokenServiceContractAddress,
//         interchainTokenServiceContractABI,
//         signer,
//     );

//     const tokenId = await interchainTokenFactoryContract.interchainTokenId(
//         signer.address,
//         salt,
//     );

//     const tokenAddress =
//         await interchainTokenServiceContract.interchainTokenAddress(tokenId);

//     const expectedTokenManagerAddress =
//         await interchainTokenServiceContract.tokenManagerAddress(tokenId);

//     const deployTxData =
//         await interchainTokenFactoryContract.deployInterchainToken(
//             salt,
//             name,
//             symbol,
//             decimals,
//             initialSupply,
//             signer.address,
//         );

//     console.log(
//         `
//         Deployed Token ID: ${tokenId},
//         Token Address: ${tokenAddress},
//         Transaction Hash: ${deployTxData.hash},
//         salt: ${salt},
//         Expected Token Manager Address: ${expectedTokenManagerAddress},
//         Deployer Address: ${signer.address}
//      `,
//     );
// }


// async function main() {
//     registerAndDeploy();
// }

// main().catch((error) => {
//     console.error(error);
//     process.exitCode = 1;
// });