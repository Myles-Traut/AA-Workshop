// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const FACTORY_NONCE = 1;

const FACTORY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const EP_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PM_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

// CREATE: hash(deployer + nonce)

async function main() {

    const entryPoint = await hre.ethers.getContractAt("EntryPoint", EP_ADDRESS);

    // Creates an address using the CREATE OPCODE as shown above
    const sender = await hre.ethers.getCreateAddress({
        from: FACTORY_ADDRESS,
        nonce: FACTORY_NONCE
    });

    const [signer0, signer1] = await hre.ethers.getSigners();
    const owner = await signer0.getAddress();
    const accountFactory = await hre.ethers.getContractFactory("AccountFactory");

    const initCode = FACTORY_ADDRESS + accountFactory.interface.encodeFunctionData("createAccount", [owner]).slice(2); // accountFactory.interface.encodeFunctionData("createAccount", [owner]).slice(2);

    const account = await hre.ethers.getContractFactory("Account");

    console.log({ sender });

    // await entryPoint.depositTo(PM_ADDRESS, {
    //     value: hre.ethers.parseEther("100")
    // });

    const userOp = {
        sender, // The address of the SCA
        nonce: await entryPoint.getNonce(sender, 0), // Nonce is managed by the EP and must be gotten from the NonceManager contract
        initCode: "0x", // The AF function createAccount and its args
        callData: account.interface.encodeFunctionData("execute"), // The function in the userOp to call 
        callGasLimit: 400_000,
        verificationGasLimit: 400_000,
        preVerificationGas: 100_000,
        maxFeePerGas: hre.ethers.parseUnits("10", "gwei"),
        maxPriorityFeePerGas: hre.ethers.parseUnits("5", "gwei"),
        paymasterAndData: PM_ADDRESS,
        signature: "0x"
    };

    const userOpHash = await entryPoint.getUserOpHash(userOp);
    userOp.signature = signer0.signMessage(hre.ethers.getBytes(userOpHash));

    const tx = await entryPoint.handleOps([userOp], owner);
    const receipt = await tx.wait();
    console.log(receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
