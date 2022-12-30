require('dotenv').config()
const { expect } = require("chai")
const SHA256 = require('crypto-js/sha256')
const { Alchemy, Network } = require("alchemy-sdk");
const convert = require('ethereum-unit-converter')
const { Identity } = require("@semaphore-protocol/identity")
const { Group } = require("@semaphore-protocol/group")
const { generateProof, verifyProof } = require("@semaphore-protocol/proof")
const fs = require('fs')


function hexToDec(hex) {
  return parseInt(hex, 16);
}

async function save_to_merkletree(id_commitment, merkleroot){
      
}


async function getasset(searchAddress){
    const config = {
      apiKey: process.env.ALCHEMY_APIKEY,
      network: Network.ETH_MAINNET,
    };
    const alchemy = new Alchemy(config);

    //The below token contract address corresponds to Dai
    const tokenContractAddresses = ["0x6b175474e89094c44da98b954eedeac495271d0f"];

    const data = await alchemy.core.getTokenBalances(
    searchAddress,
    tokenContractAddresses
    );

    console.log("Token balance for Address");
    console.log(data.tokenBalances[0].tokenBalance);
    console.log(hexToDec(data.tokenBalances[0].tokenBalance))
    return hexToDec(data.tokenBalances[0].tokenBalance)
}



const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("BillioMaZK", () => {
  let main
  let deployer, owner1
  
  beforeEach(async() => {

    // set account and name, password
    [deployer, owner1] = await ethers.getSigners()

    // deploy contract
    const mainBillio = await ethers.getContractFactory('mainBillio')
    main = await mainBillio.deploy()

    // login 
    const accountname = "Bob"
    const password = "Bobishandsome"
    const identity = new Identity(password)

    const transaction = await main.connect(deployer).login(accountname, identity.commitment)
    await transaction.wait()
  }
  )

  describe("Login", () => {
    it('Successful login', async() => {
      
      let domain = await main.getDomain(1);
      expect(domain.show_name).to.be.equal("Bob")
      expect(domain.asset).to.be.equal(tokens(0))
      expect(domain.idx).to.be.equal(1)
    })
})

  describe("Add asset", () => {
    it('Successful add asset', async() => {
      let value, outputvalue
      var searchAddress = "0xEbf29A4dc710040B12E68465331F70e42f053d7b"
      outputvalue = await getasset(searchAddress) // get address balance

      value = Math.floor(convert(outputvalue, 'wei', 'ether'))

      const transaction = await main.connect(deployer).add_asset(SHA256(searchAddress), value)
      await transaction.wait()
    })
})

  describe("Save group", () => {
    it('Successful save to correct group', async() => {
      let value, outputvalue
      var searchAddress = "0xEbf29A4dc710040B12E68465331F70e42f053d7b"
      outputvalue = await getasset(searchAddress)
      value = Math.floor(convert(outputvalue, 'wei', 'ether'))
      
      console.log(value)
      const transaction = await main.connect(deployer).add_asset(SHA256(searchAddress), value)
      await transaction.wait()

      let domain_idx = await main.maxPeople()
      console.log(domain_idx)
      let domain = await main.getDomain(domain_idx)
      console.log(domain.asset)
      if (domain.asset > 900) {
        
      }

      
    })
})

})
