import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import NETBASE from "../util/ABIs/NETBASE.json";


const MyNFTs = () => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [account, setAccount] = useState("");

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!window.ethereum) {
        setError("Please install MetaMask");
        setLoading(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        NETBASE.address,
        NETBASE.abi,
        provider
      );

      try {
        const totalSupply = await contract.totalSupply();
        const userNFTs = [];

        for (let i = 0; i < totalSupply; i++) {
          const owner = await contract.ownerOf(i);
          if (owner.toLowerCase() === accounts[0].toLowerCase()) {
            const tokenURI = await contract.tokenURI(i);
            userNFTs.push({ tokenId: i.toString(), owner, tokenURI });
          }
        }

        setNfts(userNFTs);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch NFTs");
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="flex items-center flex-col">
      <h2 className="my-2">My NFTs</h2>
      <div>
        {nfts.length > 0 ? (
          nfts.map((nft) => (
            <div
              key={nft.tokenId}
              style={{
                border: "1px solid #ccc",
                margin: "10px",
                padding: "10px",
              }}
            >
              <h3>NFT Token ID: {nft.tokenId}</h3>
              <p>Owner: {nft.owner}</p>
              <p>
                <strong>Metadata:</strong>{" "}
                <a
                  href={nft.tokenURI}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {nft.tokenURI}
                </a>
              </p>
            </div>
          ))
        ) : (
          <p>No NFTs found.</p>
        )}
      </div>
    </div>
  );
};

export default MyNFTs;
