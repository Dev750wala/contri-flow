import { assert, expect } from "chai";
import { describe } from "mocha";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../helpers";
import { ContriFlow, MockV3Aggregator } from "../typechain-types";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("ContriFlow", () => {
        let contriflow: ContriFlow, MockV3Aggregator: MockV3Aggregator, deployer: string;

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer;

            await deployments.fixture(["all"])
            const deployerSigner = await ethers.getSigner(deployer)

            contriflow = await ethers.getContractAt("ContriFlow", (await deployments.get("ContriFlow")).address, deployerSigner)
            MockV3Aggregator = await ethers.getContractAt("MockV3Aggregator", (await deployments.get("MockV3Aggregator")).address, deployerSigner)
        })

        describe("constructor", async function () {
            it("It sets aggregator addresses correctly", async function () {
                const priceFeed = await contriflow.s_priceFeed();
                assert.equal(priceFeed, await MockV3Aggregator.getAddress())
            })
        })

        describe("addAmount", async () => {
            it("Should add amount to owner's deposit", async () => {
                
            })
        })
    });