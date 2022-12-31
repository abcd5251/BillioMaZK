// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {

    // Set deployer 
    const [deployer, signer] = await ethers.getSigners()

    // Incremental merkletree deploy 
    const poseidonT3ABI = poseidonContract.generateABI(2)
    const poseidonT3Bytecode = poseidonContract.createCode(2)

    
    const PoseidonLibT3Factory = new ethers.ContractFactory(poseidonT3ABI, poseidonT3Bytecode, signer)
    const poseidonT3Lib = await PoseidonLibT3Factory.deploy()

    await poseidonT3Lib.deployed()

    console.log(`PoseidonT3 library has been deployed to: ${poseidonT3Lib.address}`)

    const IncrementalBinaryTreeLibFactory = await ethers.getContractFactory("IncrementalBinaryTree", {
        libraries: {
            PoseidonT3: poseidonT3Lib.address
        }
    })
    const incrementalBinaryTreeLib = await IncrementalBinaryTreeLibFactory.deploy()
    await incrementalBinaryTreeLib.deployed()
    console.log(`IncrementalBinaryTree library has been deployed to: ${incrementalBinaryTreeLib.address}`)

    // Semaphore deploy 
    const verifier16 = await ethers.getContractFactory("Verifier16")
    const Semaphore = await ethers.getContractFactory("Semaphore", {
      libraries: {
          IncrementalBinaryTree: incrementalBinaryTreeLib.address
      }
    })
    const verifier = await verifier16.deploy()
    await Semaphore.deploy("16",verifier.address)

    console.log(`Semaphore contract has been deployed to: ${Semaphore.address}`)

    // deploy contract
    const mainBillio = await ethers.getContractFactory('mainBillio')
    await mainBillio.deploy()
    console.log(`mainBillio contract has been deployed to: ${mainBillio.address}`)

    // deploy NFT contract
    const nftcontract1 = await ethers.getContractFactory('Number1')
    nft1 = await nftcontract1.deploy("Identity","Symbol")
    console.log(`NFT1 contract has been deployed to: ${nft1.address}`)

    const nftcontract2 = await ethers.getContractFactory('Number2')
    nft2 = await nftcontract2.deploy("Identity","Symbol")
    console.log(`NFT2 contract has been deployed to: ${nft2.address}`)

    const nftcontract3 = await ethers.getContractFactory('Number3')
    nft3 = await nftcontract3.deploy("Identity","Symbol")
    console.log(`NFT3 contract has been deployed to: ${nft3.address}`)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
