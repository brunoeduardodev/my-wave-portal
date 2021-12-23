import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import './App.css';
import { abi } from "./utils/WavePortal.json"

const contractInfo = {
  address: '0x58e206726B97E48eFC56ad563972763462b0a5fc',
  abi
}

export default function App() {
  const [currentAccount, setCurrentAccount] = useState("");
  const [waves, setWaves] = useState([])
  const [pendingTrx, setPendingTrx] = useState('')

  const getInteractionButtonText = () => {
    if (!pendingTrx) return 'Wave at me'
    else if (pendingTrx === 'error') return 'An error occurred on process your transaction'
    else return 'Your transaction are being processed'
  }

  const getContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(
      contractInfo.address,
      contractInfo.abi,
      signer
    )
  }

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) return;

    const accounts = await ethereum.request({ method: 'eth_accounts' });
    setCurrentAccount(accounts[0])
  }


  const getWavesCount = async () => {
    const wavePortalContract = getContract()
    const waves = await wavePortalContract.getTotalWaves()
    setWaves(waves)
  }

  const handleWave = async () => {
    if (!pendingTrx) return await wave()
    else window.open(`https://rinkeby.etherscan.io/tx/${pendingTrx}`, '_blank', 'noopener,noreferrer')
  }

  const wave = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const wavePortalContract = getContract()

        const waveTrx = await wavePortalContract.wave()
        setPendingTrx(waveTrx.hash)

        try {
          await waveTrx.wait()
          setPendingTrx('')
        } catch (error) {
          console.error('An error ocurred: ', error)
        }
      }
    } catch (error) {

    }
  }


  useEffect(() => {
    checkIfWalletIsConnected();
    setInterval(() => getWavesCount(), 5000)
  }, [])

  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am Nicolas and I'm studying web3! Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={handleWave}>
          {getInteractionButtonText()}
        </button>
      </div>
    </div>
  );
}
