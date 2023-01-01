import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import  SHA256  from 'crypto-js/sha256'


const Search = ({mainbillio, provider}) => {
  
  const [haslogin, sethaslogin] = useState(false)
  const [account_name, setaccount_name] = useState("")

  const clicklogin = async () => {
      const signer = await provider.getSigner()
      var account_input = ""
      var account_password = ""
      account_input = document.getElementById("input_account").value
      account_password = document.getElementById("input_password")
         
      const transaction = await mainbillio.connect(signer).login(account_input, SHA256(account_password))
      await transaction.wait()
      setaccount_name(account_input)
      alert("Successful Login!")
      sethaslogin(true)
  }

  const countasset = async () => {
      
      
  }

  useEffect(() => {
  }, [sethaslogin])

  return (
    <header>
      
      {!haslogin ?(
        <>
      <h2 className="header__subtitle">Please Login</h2>
      <h2 className="header__title">Get your certificate of wealth</h2>
      <p>Your account</p>
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
      <h2 className="header__subtitle">Welcome {account_name}</h2>
      <h2 className="header__subtitle">Let's calculate your  asset {} DAI</h2>
      <p>Your account</p>
        <input
          type="text"
          className="header__input"
          placeholder="Enter your address"
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
      )}
      
    </header>
  );
}

export default Search;