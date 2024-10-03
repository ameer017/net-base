import { useState } from "react";
import { ethers } from "ethers";
import ScrollChillNFT from "../util/ABIs/SCHILL.json";

const WalletConnect = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [count, setCount] = useState(0);

  const contractAddress = ScrollChillNFT.address;

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        console.log("Connecting to wallet...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        console.log("Requesting accounts...");
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log("Accounts received:", accounts);

        setAccount(accounts[0]);

        const contract = new ethers.Contract(
          contractAddress,
          ScrollChillNFT.abi,
          signer
        );
        setContract(contract);
        console.log("Wallet connected:", accounts[0]);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        alert("Failed to connect wallet");
      }
    } else {
      alert("Install MetaMask to interact with the app");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded"
        onClick={connectWallet}
      >
        {account
          ? `Connected: ${account.substring(0, 6)}...${account.substring(
              account.length - 4
            )}`
          : "Connect Wallet"}
      </button>

      {account && <div className="mt-8"></div>}
    </div>
  );
};

export default WalletConnect;
