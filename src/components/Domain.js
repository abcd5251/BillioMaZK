import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

const Domain = ({ domain}) => {

  return (
    <div className='card'>
      <div className='card__info'>
        <h3>{domain[0]}</h3>
      

      <p>
        <>
        <strong>
          {domain[1].toString()}
        </strong>
        DAI
        </>
      </p>
      </div>
    </div>
  );
}

export default Domain;