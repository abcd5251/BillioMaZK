import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from './components/Navigation'
import Search from './components/Search'
import Domain from './components/Domain'

// ABIs
import ETHDaddy from './abis/ETHDaddy.json'

// Config
import config from './config.json';

function App() {

  const loadBlockchainData = async () => {
    // use ether provider to connect to blockchain 
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)

    const network = await provider.getNetwork()
    console.log(network) // show network info

    window.ethereum.on('accountsChanged', async() => {  // can automatic change connect account when changing metamask address 
      const accounts = await window.ethereum.request({'method': 'eth_requestAccounts'})
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account)
      console.log(account)
    })   
  }
  
  useEffect(() => {
    loadBlockchainData()
  }, [])

  return (
    <div>

      <div className='cards__section'>

        <h2 className='cards__title'>Welcome to BillioMaZK</h2>

      </div>

    </div>
  );
}

export default App;