import "hardhat-deploy"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import { developmentChain, DECIMALS, INITIAL_ANSWER } from "../helpers"
import { network } from "hardhat";

module.exports = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments } = hre;
    const { deploy, log } = deployments;

    const { deployer } = await getNamedAccounts()
    
    if (developmentChain.includes(network.name)) {
        log("Deploying mocks...")
        const mockV3Aggregator = await deploy("MockV3Aggregator", {
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER],
            log: true,
            contract: "MockV3Aggregator",
        })
        log(`MockV3Aggregator deployed at ${mockV3Aggregator.address}`)
    }
}


module.exports.tags = ["all", "mocks"]