// Setup: npm install alchemy-sdk
const { Alchemy, Network } = require("alchemy-sdk");
const convert = require('ethereum-unit-converter')

const config = {
  apiKey: "api-key",
  network: Network.ETH_GOERLI,
};

function hexToDec(hex) {
  return parseInt(hex, 16);
}

const alchemy = new Alchemy(config);

// search address
const ownerAddress = "search address";

//The below token contract address corresponds to Dai
const tokenContractAddresses = ["0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"];

async function main(){
    const data = await alchemy.core.getTokenBalances(
    ownerAddress,
    );
    var value = convert(hexToDec(data.tokenBalances[0].tokenBalance), 'wei', 'ether')
    console.log("Token balance for Address");
    console.log(data);
    console.log(value)
}
main() // goerli testnet cannot catch balance of goerli eth, catch mainnet dai 