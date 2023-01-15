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
import config from './config/config.json'


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
    document.title = "BillioMaZK"
    // use ether provider to connect to blockchain 
    const provider = new ethers.providers.Web3Provider(window.ethereum) // (window.ethereum, "goerli")
    setProvider(provider)

    const network = await provider.getNetwork()
    console.log(network) // show network info

    // contract 
    const semaphore = new ethers.Contract(config.Semaphore.address, Semaphore, provider)
    setSemaphore(semaphore)
    const mainbillio = new ethers.Contract(config.mainBillio.address, mainBillio, provider)
    setmainBillio(mainbillio)
    const nft1 = new ethers.Contract(config.NFT1.address, Number1, provider)
    setNFT1(nft1)
    const nft2 = new ethers.Contract(config.NFT2.address, Number2, provider)
    setNFT2(nft2)
    const nft3 = new ethers.Contract(config.NFT3.address, Number3, provider)
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

  const mintNFT = async () => {
    let a, b, c, others, hash
    const signer = await provider.getSigner()

    const tokenid = await nft2.tokenId()
    const b_msg = ethers.utils.solidityPack(["address","uint256"],[account,tokenid])
    const msg = ethers.utils.keccak256(b_msg)
    window.ethereum.enable() 
    const signature = window.ethereum.request({method: "personal_sign", params: [account, msg]})

    a = document.getElementById("input_proof_a").value
    const a_array = JSON.parse(a)
    const a_proof = a_array.map(item => parseInt(item));

    b = document.getElementById("input_proof_b").value
    const b_array = JSON.parse(b)
    console.log(b_array)
    const b_proof = b_array.map(item => parseInt(item));

    c = document.getElementById("input_proof_c").value
    const c_array = JSON.parse(c)
    const c_proof = c_array.map(item => parseInt(item));

    others = document.getElementById("input_proof_other").value
    const other_array = JSON.parse(others)
    const other_proof = other_array.map(item => parseInt(item));
    
    
    const transaction22 = await nft2.connect(signer).mint(account, a_proof, b_proof, c_proof, other_proof)
    await transaction22.wait()
    alert("Successful Claim Your Certificate NFT!")

    document.getElementById("input_proof_a").value = ""
    document.getElementById("input_proof_b").value = ""
    document.getElementById("input_proof_c").value = ""
    document.getElementById("input_proof_other").value = ""
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
      <h1 className='downheader_title'>Input proof to get your certificate nft</h1>
      <input
          type="text"
          className="proof_input"
          placeholder="Enter your Proof a"
          id="input_proof_a"
        />
      <input
          type="text"
          className="proof_input"
          placeholder="Enter your Proof b"
          id="input_proof_b"
        />
      <input
          type="text"
          className="proof_input"
          placeholder="Enter your Proof c"
          id="input_proof_c"
        />
      <input
          type="text"
          className="proof_input"
          placeholder="Enter other inputs"
          id="input_proof_other"
        />
      <button type="button" className='proof_buttom' onClick={() => mintNFT()}>Claim NFT</button>

    </div>
  );
}

export default App;
