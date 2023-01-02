require('dotenv').config()
const { expect } = require("chai")
const SHA256 = require('crypto-js/sha256')
const { Alchemy, Network } = require("alchemy-sdk");
const convert = require('ethereum-unit-converter')
const { Identity } = require("@semaphore-protocol/identity")
const { Group } = require("@semaphore-protocol/group")
const { generateProof, verifyProof , packToSolidityProof} = require("@semaphore-protocol/proof")
const { poseidonContract} =  require("circomlibjs")
const fs = require('fs')


function hexToDec(hex) {
  return parseInt(hex, 16);
}



async function getasset(searchAddress){
    const config = {
      apiKey: "SEIDb2b8ce6bAGXPCRaEtr_SPi-WpFjq",
      network: Network.ETH_MAINNET,
    };
    
    const alchemy = new Alchemy(config);

    //The below token contract address corresponds to Dai
    const tokenContractAddresses = ["0x6b175474e89094c44da98b954eedeac495271d0f"];

    const data = await alchemy.core.getTokenBalances(
    searchAddress,
    tokenContractAddresses
    );

    //console.log("Token balance for Address");
    //console.log(data.tokenBalances[0].tokenBalance);
    console.log(hexToDec(data.tokenBalances[0].tokenBalance))
    return hexToDec(data.tokenBalances[0].tokenBalance)
}



const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("BillioMaZK", () => {
  let main, semaphore , identity1, nft1, nft2, nft3
  

  beforeEach(async() => {
    // Incremental merkletree deploy 
    const poseidonT3ABI = poseidonContract.generateABI(2)
    const poseidonT3Bytecode = poseidonContract.createCode(2)

    // Set deployer 
    const [deployer, signer] = await ethers.getSigners()

    const PoseidonLibT3Factory = new ethers.ContractFactory(poseidonT3ABI, poseidonT3Bytecode, signer)
    const poseidonT3Lib = await PoseidonLibT3Factory.deploy()

    await poseidonT3Lib.deployed()

    const IncrementalBinaryTreeLibFactory = await ethers.getContractFactory("IncrementalBinaryTree", {
        libraries: {
            PoseidonT3: poseidonT3Lib.address
        }
    })
    const incrementalBinaryTreeLib = await IncrementalBinaryTreeLibFactory.deploy()
    await incrementalBinaryTreeLib.deployed()

    // Semaphore deploy 
    const verifier16 = await ethers.getContractFactory("Verifier16")
    const Semaphore = await ethers.getContractFactory("Semaphore", {
      libraries: {
          IncrementalBinaryTree: incrementalBinaryTreeLib.address
      }
    })
    const verifier = await verifier16.deploy()
    semaphore = await Semaphore.deploy("16",verifier.address)

    

    // deploy contract
    const mainBillio = await ethers.getContractFactory('mainBillio')
    main = await mainBillio.deploy()
   
     // deploy NFT contract
    const nftcontract1 = await ethers.getContractFactory('Number1')
    nft1 = await nftcontract1.deploy("Identity","Symbol",verifier.address)
    

    const nftcontract2 = await ethers.getContractFactory('Number2')
    nft2 = await nftcontract2.deploy("Identity","Symbol",verifier.address)
    

    const nftcontract3 = await ethers.getContractFactory('Number3')
    nft3 = await nftcontract3.deploy("Identity","Symbol",verifier.address)
    

    // Set account and name, password  
    const accountname = "Bob"
    const password = "Bobishandsome"
    identity1 = new Identity(password)

    const transaction = await main.connect(deployer).login(accountname, identity1.commitment)
    await transaction.wait()
    
  })

  describe("Deploy Contract", () => {
    it('Successful Deploy', async() => {
      
      console.log(`Semaphore contract has been deployed to: ${semaphore.address}`)
      console.log(`mainBillio contract has been deployed to: ${main.address}`)
      console.log(`NFT1 contract has been deployed to: ${nft1.address}`)
      console.log(`NFT2 contract has been deployed to: ${nft2.address}`)
      console.log(`NFT3 contract has been deployed to: ${nft3.address}`)
    })
})

  describe("Login", () => {
    it('Successful login', async() => {
      
      let domain = await main.getDomain(0);
      expect(domain.show_name).to.be.equal("Bob")
      expect(domain.asset).to.be.equal(tokens(0))
      expect(domain.idx).to.be.equal(0)
    })
})

  describe("Add asset", () => {
    it('Successful add asset', async() => {
      let value, outputvalue
      var searchAddress = "0xEbf29A4dc710040B12E68465331F70e42f053d7b"
      outputvalue = await getasset(searchAddress) // get address balance

      value = Math.floor(convert(outputvalue, 'wei', 'ether'))
      const [deployer] = await ethers.getSigners()
      console.log("address",deployer.address)
      const transaction = await main.connect(deployer).add_asset(SHA256(searchAddress), value)
      await transaction.wait()

      const transaction_add = await main.connect(deployer).add_asset(SHA256(searchAddress), value)
      await transaction_add.wait()

      let domain = await main.getDomain(0);
      console.log("After adding :", domain.asset)

    })
})

  describe("Save group", () => {
    it('Successful save to correct group and verify the proof', async() => {

      const [deployer] = await ethers.getSigners()
      console.log("address",deployer.address)

      // Save asset 
      const transaction_save = await main.connect(deployer).save_asset()
      await transaction_save.wait()
      const logging_status = await main.logging()
      console.log("logging status: ", logging_status)

      // Create group 
      const transaction_group1 = await semaphore.connect(deployer).createGroup(1, 16, BigInt(1), deployer.address)
      await transaction_group1.wait()

      const transaction_group2 = await semaphore.connect(deployer).createGroup(2, 16, BigInt(1), deployer.address)
      await transaction_group2.wait()

      const transaction_group3 = await semaphore.connect(deployer).createGroup(3, 16, BigInt(1), deployer.address)
      await transaction_group3.wait()
      
      const addddd = await semaphore.connect(deployer).addMember(1, identity1.commitment)
      await addddd.wait()

      // generate proof   
      const group = new Group(16, BigInt(1))
      group.addMember(identity1.commitment)
      const java_externalNullifier = group.root
    
      const greeting = "0x000000000000000000000000000000000000000000000000000000000000007b"

      const fullProof = await generateProof(identity1, group, java_externalNullifier, greeting, {
        zkeyFilePath: "./test_semaphore/semaphore.zkey",
        wasmFilePath: "./test_semaphore/semaphore.wasm"
      })

      const proof = packToSolidityProof(fullProof.proof)

      // verify proof onchain 
      const { merkleRoot, nullifierHash, signalHash, externalNullifier} = fullProof.publicSignals
      const transaction10 = await semaphore.connect(deployer).verifyProof(1, merkleRoot, greeting, nullifierHash, externalNullifier, proof)
      await transaction10.wait()
      console.log("Solidity on chain:", "pass")

    
      // verify proof offchain 
      const verificationKey = JSON.parse(fs.readFileSync("./test_semaphore/semaphore.json", "utf-8"))
      const pass = await verifyProof(verificationKey, fullProof).then(v => v.toString())
      console.log("javascript off chain:", pass)

      console.log([deployer.address,1,[proof[0],proof[1]],[[proof[2],proof[3]],[proof[4],proof[5]]],[proof[6],proof[7]],[merkleRoot, nullifierHash, signalHash, externalNullifier]])
      //successful claim nft 
      const transaction112= await nft1.connect(deployer).mint(deployer.address,1,[proof[0],proof[1]],[[proof[2],proof[3]],[proof[4],proof[5]]],[proof[6],proof[7]],[merkleRoot, nullifierHash, signalHash, externalNullifier])
      await transaction112.wait()
      console.log("nftmint :", "pass")
      
    })
})
})
