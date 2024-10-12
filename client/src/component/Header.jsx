import { useState } from "react";
import { ethers } from "ethers";
import NETBASE from "../util/ABIs/NETBASE.json";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Header = () => {
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  const contractAddress = NETBASE.address;

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
          NETBASE.abi,
          signer
        );
        setContract(contract);
        setConnected(true);
        console.log("Wallet connected:", accounts[0]);
      } catch (error) {
        console.error("Error connecting to wallet:", error);
        toast.error("Failed to connect wallet");
      }
    } else {
      toast.warn("Install MetaMask to interact with the app");
    }
  };

  return (
    <header className="bg-blue-600 p-4 flex justify-between items-center text-white">
      <Link to="/" className="text-xl font-bold">
        Net Base
      </Link>
      <nav>
        {connected && account && (
          <ul className="flex space-x-4">
            <li>
              <Link to="/create" className="hover:underline">
                Create Watch Party
              </Link>
            </li>
            <li>
              <Link to="/party-list" className="hover:underline">
                PartyList
              </Link>
            </li>
            <li>
              <Link to="/my-nfts" className="hover:underline">
                My NFTs
              </Link>
            </li>
          </ul>
        )}
      </nav>
      <div>
        <button
          className="px-4 py-2 bg-white text-blue-600 rounded"
          onClick={connectWallet}
        >
          {account && connected ? `Connected` : "Connect Wallet"}
        </button>
      </div>
    </header>
  );
};

export default Header;
