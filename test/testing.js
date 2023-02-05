require('dotenv').config()
const { expect } = require("chai")
const { Alchemy, Network } = require("alchemy-sdk");
const { groth16 } = require("snarkjs");
const convert = require('ethereum-unit-converter')
const { Identity } = require("@semaphore-protocol/identity")
const { Group } = require("@semaphore-protocol/group")
const { generateProof, verifyProof , packToSolidityProof} = require("@semaphore-protocol/proof")
const { poseidonContract} =  require("circomlibjs")
const { createHash } = require('crypto')
const fs = require('fs')


function hexToDec(hex) {
  return parseInt(hex, 16);
}

function hash(string){
  return createHash('sha256').update(string).digest('hex');
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
    //console.log(hexToDec(data.tokenBalances[0].tokenBalance))
    return hexToDec(data.tokenBalances[0].tokenBalance)
}



const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("BillioMaZK", () => {
  let main, semaphore , identity1, nft1, nft2, nft3, User, args
  

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

    nft2 = poseidonT3Lib.address
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
    

    //const nftcontract2 = await ethers.getContractFactory('Number2')
    //nft2 = await nftcontract2.deploy("Identity","Symbol",verifier.address)
    

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
      console.log(`NFT2 contract has been deployed to: ${semaphore.address}`)
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
      console.log("first address DAI: ", value)
      const [deployer] = await ethers.getSigners()
      console.log("address",deployer.address)

      const transaction = await main.connect(deployer).add_asset(hash(searchAddress), value)
      await transaction.wait()
      

      var searchAddress2 = "0xed68b9bf0cB0d6Cdb3901DF586073BD18372E5F9"
      outputvalue = await getasset(searchAddress2)
      value = Math.floor(convert(outputvalue, 'wei', 'ether'))
      console.log("second address DAI: ", value)
      const transaction_add = await main.connect(deployer).add_asset(hash(searchAddress2), value)
      await transaction_add.wait()
      

      let domain = await main.getDomain(0);
      console.log("After adding :", domain.asset)

    })
})

  describe("Save group", () => {
    beforeEach(async() => {
      const [deployer] = await ethers.getSigners()
      //console.log("address : ",deployer.address)

       // Create group 
       const transaction_group1 = await semaphore.connect(deployer).createGroup(1, 16, BigInt(1), deployer.address)
       await transaction_group1.wait()
 
       const transaction_group2 = await semaphore.connect(deployer).createGroup(2, 16, BigInt(1), deployer.address)
       await transaction_group2.wait()
 
       const transaction_group3 = await semaphore.connect(deployer).createGroup(3, 16, BigInt(1), deployer.address)
       await transaction_group3.wait()

       User = deployer
    
    })
    it('Successful save to correct group and verify the proof', async() => {

      // Save asset 
      const transaction_save = await main.connect(User).save_asset()
      await transaction_save.wait()
      const logging_status = await main.logging()
      console.log("logging status: ", logging_status)
      
      const addddd = await semaphore.connect(User).addMember(1, identity1.commitment)
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
      
      // process proof 
      const proof = packToSolidityProof(fullProof.proof)
      const { merkleRoot, nullifierHash, signalHash, externalNullifier} = fullProof.publicSignals

      const calldata = await groth16.exportSolidityCallData(fullProof.proof,[merkleRoot, nullifierHash, signalHash, externalNullifier])
      args = JSON.parse("[" + calldata + "]")
      console.log(args)
      
      // verify proof onchain 
      const transaction10 = await semaphore.connect(User).verifyProof(1, merkleRoot, greeting, nullifierHash, externalNullifier, proof)
      await transaction10.wait()
      console.log("Solidity on chain:", "pass")

    
      // verify proof offchain 
      const verificationKey = JSON.parse(fs.readFileSync("./test_semaphore/semaphore.json", "utf-8"))
      const pass = await verifyProof(verificationKey, fullProof).then(v => v.toString())
      console.log("javascript off chain:", pass)
    })

    it('Successful claim NFT', async() => {
      // Calculate account signature 
      // use 0xe16C1623c1AA7D919cd2241d8b36d9E79C1Be2A2 account to claim nft 
      const account = "0xe16C1623c1AA7D919cd2241d8b36d9E79C1Be2A2"
      
      // eth_sign is different from personal sign (metamask use personal sign)
      // so cannot use ether.wallet.signMessage
      /*
      const wallet = new ethers.Wallet(privateKey)
      const signature = await wallet.signMessage(hash_msg)
      console.log(signature)
      const {v, r, s} = ethers.utils.splitSignature(signature);
      console.log(`${r}${s}${v.toString(16).padStart(2, '0')}`)
      console.log(sss)
      */

      var tokenId = 1
      const b_msg = ethers.utils.solidityPack(["address","uint256"],[account,tokenId])
      const msg = ethers.utils.keccak256(b_msg)
      console.log(msg)
      const a_msg = ethers.utils.solidityPack(["string","bytes32"],["\x19Ethereum Signed Message:\n32", msg])
      const hash_msg = ethers.utils.keccak256(a_msg)
      console.log(hash_msg)

      const transaction1112= await nft1.connect(User).ethSignedMessageHash(account,tokenId)
      console.log(transaction1112)

       // remember if change address or tokenID, signature need to change
      // use this to get signature of account, 
      /*
      ethereum.enable()
      account = "0xe16C1623c1AA7D919cd2241d8b36d9E79C1Be2A2"
      hash = msg   // 0x720a2781b027747cc69460f967811632863b5c22a5643d21119e5948faf9cacf
      ethereum.request({method: "personal_sign", params: [account, hash]})
      */
      var signature = "0x3eb288390a6fb89743329725bb25ae9db311c9dc611fe2da787057ba7a730f6c7c1f5ab8fb9ab9465200a9cfa64173e04b4b79623efa44a749e95f405e879bd01c"

      // check recover signer address
      const cc = await nft1.connect(User).checkrecover("0xac74a2edc1f35e5bb92cb6b4ae05ac8cbe6a5628a64bac4d619fccb0b0f37daf",signature)
      console.log("signer address :",cc)


      //successful claim nft 
      const transaction112= await nft1.connect(User).mint(account,signature,...args)
      await transaction112.wait()
      console.log("nftmint :", "pass")
    })
})
})
