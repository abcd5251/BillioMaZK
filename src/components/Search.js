import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import  SHA256  from 'crypto-js/sha256'
import { Alchemy, Network } from "alchemy-sdk"
import convert from 'ethereum-unit-converter'
//import { Identity } from "@semaphore-protocol/identity"
//import { Group } from "@semaphore-protocol/group"
//import { generateProof, verifyProof , packToSolidityProof} from "@semaphore-protocol/proof"


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

  console.log("ddd",hexToDec(data.tokenBalances[0].tokenBalance))
  return hexToDec(data.tokenBalances[0].tokenBalance)
}

const Search = ({mainbillio, semaphore, provider, account}) => {
  
  const [haslogin, sethaslogin] = useState(false)
  const [showproof, setshowproof] = useState(false)
  const [account_name, setaccount_name] = useState("")
  const [current_balance, setcurrent] = useState(0)
  const [total_balance, settotal] = useState(0)

  const clicklogin = async () => {

      const signer = await provider.getSigner()
      var account_input = ""
      var account_password = ""
      account_input = document.getElementById("input_account").value
      account_password = document.getElementById("input_password").value
      console.log(account_input)
      console.log(account_password)
      console.log(signer.address)
      
      const transaction = await mainbillio.connect(signer).login(account_input, SHA256(account_password))
      await transaction.wait()

      document.getElementById("input_account").value = ""
      document.getElementById("input_password").value = ""

      setaccount_name(account_input)
      alert("Successful Login!")
      sethaslogin(true)

  }

  const countasset = async () => {
      var address_balance = await getasset(account)
      var value = Math.floor(convert(address_balance, 'wei', 'ether'))
      setcurrent(value)
  }

  const addasset = async () => {
    const signer = await provider.getSigner()
    var address_balance = await getasset(account)
    var value = Math.floor(convert(address_balance, 'wei', 'ether'))
    const transaction1 = await mainbillio.connect(signer).add_asset(SHA256(account),value)
    await transaction1.wait()
    var saving = total_balance + value
    settotal(saving)
    alert("Successful add your asset!")
}

  const saveasset = async () => {
    const signer = await provider.getSigner()

    const transactionff = await mainbillio.connect(signer).save_asset()
    await transactionff.wait()

    setcurrent(0)
    settotal(0)
    sethaslogin(false)
    alert("Successful submit to leaderboard!")
    setshowproof(true)
  }

  useEffect(() => {
  }, [sethaslogin])

  return (
    <header>
      
      {!haslogin ?(
        <>
      <h2 className="header__title">Get certificate of asset</h2>
      <h2 className="header__login">Please Login</h2>
      
        <input
          type="text"
          className="header__input"
          placeholder="Enter your account"
          id="input_account"
          
        />
        <br/>
        <input
          type="password"
          className="header__input"
          placeholder="Enter your password"
          id="input_password"
          
        />
        <button
          type="button"
          className='header__button'
          onClick={() => clicklogin()}
        >
          Login
        </button>
        </>
      ) : (
        <>
      <h2 className="header__subtitle">Welcome {account_name}!</h2>
      <h2 className="header__subtitle2">Let's calculate your asset </h2>
      <h3>---------------------------------------------------------------------------------------------------</h3>
      <h3 className="header__word">Connected Address : {account}</h3>
      <h3 className="header__word">Address balance :  {current_balance} </h3>
        <br/>
        <button type="button"
          className='header__button3'
          onClick={() => countasset()}>Show</button>
        <button
          type="button"
          className='header__button'
          onClick={() => addasset()}
        >
          Add
        </button>
        <button
          type="button"
          className='header__button4'
          onClick={() => saveasset()}
        >
          Save
        </button>
      <h3 className="header__total">Total balance :  {total_balance} </h3>
      <br/>
        </>
      )}
      
    </header>
  );
}

export default Search;