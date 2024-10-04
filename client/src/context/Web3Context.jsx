import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import NETBASE from "../util/ABIs/NETBASE.json";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const setupWeb3 = async () => {
      if (!window.ethereum) {
        setError("Ethereum provider not found. Please install MetaMask.");
        return;
      }

      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(web3Provider);

        const signer = web3Provider.getSigner();
        setSigner(signer);

        const accounts = await web3Provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);

        const contractInstance = new ethers.Contract(
          NETBASE.address,
          NETBASE.abi,
          signer
        );
        setContract(contractInstance);
      } catch (err) {
        console.error("Error setting up Web3:", err);
        setError("Failed to load Web3. Please try again.");
      }
    };

    setupWeb3();
  }, []);

  return (
    <Web3Context.Provider
      value={{ provider, signer, contract, account, error }}
    >
      {children}
    </Web3Context.Provider>
  );
};
