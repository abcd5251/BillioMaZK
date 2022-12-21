// cannot get balance 
// Error: Request failed with status code 429

const DeBankOpenApi = require('debank-open-api');

let apiInstance = new DeBankOpenApi.UserApi();
let id = "0xed68b9bf0cB0d6Cdb3901DF586073BD18372E5F9"; // String | User Address
let chainId = "420"; // String | ChainID

apiInstance.getUserTotalBalance(id, chainId).then((response) => {
  console.log(response);
}, (error) => {
  console.error(error);
});