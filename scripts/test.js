// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
    const ACC_ADDRESS = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c";
    const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

    const account = await hre.ethers.getContractAt("Account", ACC_ADDRESS);
    const ep = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);
    const count = await account.count();
    console.log("Account Balance", await hre.ethers.provider.getBalance(account));
    console.log("Acc EP Bal", await ep.balanceOf(account));
    console.log("PM EP Bal", await ep.balanceOf(PM_ADDRESS));
    console.log(count);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
