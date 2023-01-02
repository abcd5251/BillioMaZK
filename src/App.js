import { useEffect, useState } from 'react'
import { ethers } from 'ethers'


// Components
import Navigation from './components/Navigation'
import Search from './components/Search'
import Domain from './components/Domain'


// ABIs
import mainBillio from './abis/mainBillio.json'
import Number1 from './abis/Number1.json'
import Number2 from './abis/Number2.json'
import Number3 from './abis/Number3.json'
import Semaphore from './abis/Semaphore.json'

// Config
import use from './config/use.json'
import config from './config/config.json';


function App() {
  const [provider, setProvider] = useState(null)
  const [account, setAccount] = useState(null) // call hook account default: null

  const [nft1, setNFT1] = useState(null)
  const [nft2, setNFT2] = useState(null)
  const [nft3, setNFT3] = useState(null)
  const [semaphore, setSemaphore] = useState(null)
  const [mainbillio, setmainBillio] = useState(null)
  const [sort_domains, setDomains] = useState([]) // create array of domains


  const loadBlockchainData = async () => {

    // use ether provider to connect to blockchain 
    const provider = new ethers.providers.Web3Provider(window.ethereum) // (window.ethereum, "goerli")
    setProvider(provider)

    const network = await provider.getNetwork()
    console.log(network) // show network info

    // contract 
    const semaphore = new ethers.Contract(config[network.chainId].Semaphore.address, Semaphore, provider)
    setSemaphore(semaphore)
    const mainbillio = new ethers.Contract(config[network.chainId].mainBillio.address, mainBillio, provider)
    setmainBillio(mainbillio)
    const nft1 = new ethers.Contract(config[network.chainId].NFT1.address, Number1, provider)
    setNFT1(nft1)
    const nft2 = new ethers.Contract(config[network.chainId].NFT2.address, Number2, provider)
    setNFT2(nft2)
    const nft3 = new ethers.Contract(config[network.chainId].NFT3.address, Number3, provider)
    setNFT3(nft3)

    // Calculate Asset rank 
    const maxPeople = await mainbillio.maxPeople()
    console.log(maxPeople.toString()) 
    const domains_asset = {}

    for (var i = 0; i < maxPeople; i++){
      const domain = await mainbillio.getDomain(i)
      domains_asset[domain.show_name] = domain.asset
    }
    const sort_domains = Object.entries(domains_asset).sort((a, b) => b[1] - a[1]);
    setDomains(sort_domains)
    console.log(sort_domains)



    window.ethereum.on('accountsChanged', async() => {  // automatic change connect account 
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
      <Navigation account = {account} setAccount = {setAccount} />

      <Search mainbillio={mainbillio} semaphore = {semaphore} provider={provider} account = {account}/>
   
      <div className='cards__section'>
        <h2 className='cards__title'>Asset Ranking</h2>
        <p className='cards__description'>
          
        </p>

        <hr />

        <div className='cards'>
          {sort_domains.map((domain) => ( 
             <Domain domain={domain}/>
          ))}
        </div>

        


      </div>
      <hr />
      <h1 className='buttom_title'>Input proof to get your certificate nft</h1>
      <input/>
      <button></button>

    </div>
  );
}

export default App;