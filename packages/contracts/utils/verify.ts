import { run } from "hardhat"

export async function verify(contractAddress: string, args: string[]) {
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args
        })
    } catch (error: any) {
        if (error.message.includes("already") || error.message.includes("verified")) {
            console.log("Contract source code already verified")
        } else {
            console.log(error)
        }
    }
}