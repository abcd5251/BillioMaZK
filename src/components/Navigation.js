import { ethers } from 'ethers';
import logo from '../assets/logo.svg';

const Navigation = ({ account, setAccount }) => {
  const connectHandler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.utils.getAddress(accounts[0])
    setAccount(account);
  }

  return (
    <nav>
      <div className='nav__brand'>
        <img src={logo} alt="Logo" />
        <h1>BillioMaZK</h1>

        <ul className='nav__links'>
          <li><a href="/">Account Names</a></li>
          <li><a href="/">About Certificate</a></li>
          <li><a href="/">Donate</a></li>
          <li><a href="/">Contact Us</a></li>
        </ul>
      </div>

      {account ? (
        <button
          type="button"
          className='nav__connect'
        >
          {account.slice(0, 6) + '...' + account.slice(38, 42)}
        </button>
      ) : (
        <button
          type="button"
          className='nav__connect'
          onClick={connectHandler}
        >
          Connect
        </button>
      )}
    </nav>
  );
}

export default Navigation;