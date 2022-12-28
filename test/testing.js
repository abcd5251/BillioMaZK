const { expect } = require("chai")
const SHA256 = require('crypto-js/sha256')
const { Alchemy, Network } = require("alchemy-sdk");
const convert = require('ethereum-unit-converter')

function hexToDec(hex) {
  return parseInt(hex, 16);
}

async function getasset(searchAddress){
    const config = {
      apiKey: "apikey",
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
    const transaction = await main.connect(deployer).login(accountname, SHA256(password))
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
      var searchAddress = ""
      outputvalue = await getasset(searchAddress)
      value = convert(outputvalue, 'wei', 'ether')
      value = value - 0.8
      console.log(value)
      const transaction = await main.connect(deployer).add_asset(SHA256(searchAddress), value)

      let domain = await main.getDomain(1);
      console.log(domain.asset)
    })
})

})
