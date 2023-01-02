// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");
const { poseidonContract} =  require("circomlibjs")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {

    // Set deployer 
    const [deployer] = await ethers.getSigners()
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Incremental merkletree deploy 
    const poseidonT3ABI = poseidonContract.generateABI(2)
    const poseidonT3Bytecode = poseidonContract.createCode(2)

    
    const PoseidonLibT3Factory = new ethers.ContractFactory(poseidonT3ABI, poseidonT3Bytecode, deployer)
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

    // Verifier deploy 
    const verifier16 = await ethers.getContractFactory("Verifier16")
    const verifier = await verifier16.deploy()
    console.log(`Verifier contract has been deployed to: ${verifier.address}`)
    
    // Semaphore deploy 
    const Semaphore = await ethers.getContractFactory("Semaphore", {
      libraries: {
          IncrementalBinaryTree: incrementalBinaryTreeLib.address
      }
    })
    const semaphore = await Semaphore.deploy("16",verifier.address)
    console.log(`Semaphore contract has been deployed to: ${semaphore.address}`)

    // Create three certificate of semaphore group
    const transaction_group1 = await semaphore.connect(deployer).createGroup(1, 16, BigInt(1), deployer.address)
    await transaction_group1.wait()
    console.log(`Group1 has created`)

    const transaction_group2 = await semaphore.connect(deployer).createGroup(2, 16, BigInt(1), deployer.address)
    await transaction_group2.wait()
    console.log(`Group2 has created`)

    const transaction_group3 = await semaphore.connect(deployer).createGroup(3, 16, BigInt(1), deployer.address)
    await transaction_group3.wait()
    console.log(`Group3 has created`)

    // deploy main contract
    const mainBillio = await ethers.getContractFactory('mainBillio')
    const main = await mainBillio.deploy()
    console.log(`mainBillio contract has been deployed to: ${main.address}`)

    // deploy NFT contract
    const nftcontract1 = await ethers.getContractFactory('Number1')
    const nft1 = await nftcontract1.deploy("Identity1","Symbol1", verifier.address)
    console.log(`NFT1 contract has been deployed to: ${nft1.address}`)

    const nftcontract2 = await ethers.getContractFactory('Number2')
    const nft2 = await nftcontract2.deploy("Identity2","Symbol2", verifier.address)
    console.log(`NFT2 contract has been deployed to: ${nft2.address}`)

    const nftcontract3 = await ethers.getContractFactory('Number3')
    const nft3 = await nftcontract3.deploy("Identity3","Symbol3", verifier.address)
    console.log(`NFT3 contract has been deployed to: ${nft3.address}`)

    // Add default domain people for demo
    const transaction = await main.connect(deployer).setfordemo()
    await transaction.wait()
    for (var i = 0; i < 6; i++) {
      let showdomain = await main.getDomain(i);
      console.log(`Listed Domain ${i}: ${showdomain.show_name}`)
      console.log(`Listed Domain ${i}: ${showdomain.asset}`)
    }   

    const maxPeople = await main.maxPeople()
    console.log(maxPeople.toString()) 

    const contract_addresses = {
      "31337": {
          "mainBillio": {
              "address": main.address
          },
          "Semaphore": {
              "address": semaphore.address
          },
          "NFT1": {
              "address": nft1.address
          },
          "NFT2": {
              "address": nft2.address
          },
          "NFT3": {
              "address": nft3.address
          },
          "Verifier": {
              "address": verifier.address
          }
      }
  }
  saveconfigaddress(contract_addresses);
}

function saveconfigaddress(contract_addresses) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../src/config";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  fs.writeFileSync(
    contractsDir + `/config.json`,
    JSON.stringify(contract_addresses, undefined, 2)
   
  );
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
