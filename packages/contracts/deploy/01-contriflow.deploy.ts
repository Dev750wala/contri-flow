import "hardhat-deploy";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { developmentChain, networkConfig } from "../helpers";
import { network } from "hardhat";
import { verify } from "../utils/verify";

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;

    const { deployer } = await getNamedAccounts();

    let ethUsdPriceFeedAddress: string;
    if (developmentChain.includes(network.name)) {
        log("Local network detected!...");
        ethUsdPriceFeedAddress = (await deployments.get("MockV3Aggregator")).address;
        console.log(`Using mock price feed at address: ${ethUsdPriceFeedAddress}`);
    } else {
        ethUsdPriceFeedAddress = networkConfig[network.config.chainId!].ethUsdPriceFeed!;
        console.log(`Using real price feed at address: ${ethUsdPriceFeedAddress}`);
    }

    const args = [ethUsdPriceFeedAddress];
    const contriflow = await deploy("ContriFlow", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: 1,
        contract: "ContriFlow",
    })

    if (!developmentChain.includes(network.name)) {
        console.log("Trying to verify the contract on Etherscan...");

        await verify(contriflow.address, args)
    }
}

module.exports.tags = ["all", "contriflow"];