import hre, { ethers } from "hardhat";
import config from "../config";
import UniSwapV2RouterABI from "../ABI/UniswapV2Router02.json";
import TokenABI from "../ABI/MPT-Token.json";
import { MPTToken, UniswapV2Router02 } from "../typechain-types";

async function getSigner() {
    const [deployer] = await hre.ethers.getSigners();
    return deployer;
}

async function main() {
    const deployer = await getSigner();

    const tokenAmount = ethers.parseUnits("1000.0", 18); // 1000 TOK (18 decimals)
    const ethAmount = ethers.parseEther("0.5");         // 0.5 ETH

    const token: MPTToken = await ethers.getContractAt(TokenABI, config.MPT_TOKEN_ADDRESS) as unknown as MPTToken;
    const router: UniswapV2Router02 = await ethers.getContractAt(UniSwapV2RouterABI, config.UNISWAP_ROUTER_ADDRESS) as unknown as UniswapV2Router02;

    // approve router to spend tokens
    const approveTx = await token.connect(deployer).approve(config.UNISWAP_ROUTER_ADDRESS, tokenAmount);
    await approveTx.wait();
    console.log("Approved router to spend tokens");

    // add liquidity to Uniswap
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    const minToken = tokenAmount * 98n / 100n; // accept 2% slippage
    const minETH = ethAmount * 98n / 100n;

    const tx = await router.connect(deployer).addLiquidityETH(
        config.MPT_TOKEN_ADDRESS,
        tokenAmount,
        minToken,
        minETH,
        deployer.address,
        deadline,
        { value: ethAmount }
    );
    const receipt = await tx.wait();
    console.log("addLiquidityETH receipt", receipt?.hash);
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
