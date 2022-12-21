// Setup: npm install alchemy-sdk
const { Alchemy, Network } = require("alchemy-sdk");

const config = {
  apiKey: "api-key",
  network: Network.ETH_MAINNET,
};
const alchemy = new Alchemy(config);

// search address
const ownerAddress = "";

//The below token contract address corresponds to Dai
const tokenContractAddresses = ["0x6b175474e89094c44da98b954eedeac495271d0f"];

async function main(){
    const data = await alchemy.core.getTokenBalances(
    ownerAddress,
    tokenContractAddresses
    );

    console.log("Token balance for Address");
    console.log(data);
}
main()

