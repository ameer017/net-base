import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";
import { toast } from "react-toastify";

const PartyDetails = () => {
  const { id } = useParams();
  const { contract, account } = useContext(Web3Context);
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movieToVote, setMovieToVote] = useState("");
  const [loadingVote, setLoadingVote] = useState(false);
  const [loadingClose, setLoadingClose] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [winningMovie, setWinningMovie] = useState("");
  const [voteCount, setVoteCount] = useState(0);
  const [loadingCheckVotes, setLoadingCheckVotes] = useState(false);
  const [loadingMintNFT, setLoadingMintNFT] = useState(false);
  const [rewardAmount, setRewardAmount] = useState("");
  const [loadingDistributeRewards, setLoadingDistributeRewards] = useState(false);
  
  const [voterAddress, setVoterAddress] = useState("");

  useEffect(() => {
    const fetchPartyDetails = async () => {
      if (!contract) return;

      setLoading(true);
      try {
        const partiesList = await contract.getAllParties();
        const partyData = partiesList.find(
          (party) => party.id.toNumber() === parseInt(id)
        );

        if (partyData) {
          const formattedParty = {
            id: partyData.id.toNumber(),
            title: partyData.title,
            partyTime: partyData.partyTime.toNumber(),
            host: partyData.host,
            active: partyData.active,
            partyClosed: partyData.partyClosed,
            winningMovie: partyData.winningMovie,
            movieOptions: partyData.movieOptions,
            votes: partyData.votes,
          };

          setParty(formattedParty);
          setIsHost(partyData.host.toLowerCase() === account.toLowerCase());
          console.log(formattedParty.votes);
        } else {
          setError("Party not found.");
        }
      } catch (error) {
        console.error("Error fetching party details:", error);
        setError("Could not fetch party details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPartyDetails();
  }, [contract, id, account]);

  let allAddresses = [];

  const handleVote = async () => {
    if (!contract || !movieToVote) return;

    setLoadingVote(true);
    try {
      const transaction = await contract.voteForMovie(party.id, movieToVote);
      await transaction.wait();
      toast.success("Vote cast successfully!");

      contract.on("VoteCasted", (voter, partyId, movie) => {
        if (partyId.toNumber() === parseInt(id)) {
          console.log(`Voter Address: ${voter}, Movie Voted: ${movie}`);

          allAddresses.push({
            voterAddress: voter,
            movieTitle: movie,
          });

          setParty((prevParty) => ({
            ...prevParty,
            votes: allAddresses,
          }));
        }
      });

      const partiesList = await contract.getAllParties();
      const updatedParty = partiesList.find(
        (party) => party.id.toNumber() === parseInt(id)
      );

      console.log(updatedParty);

      const formattedUpdatedParty = {
        id: updatedParty.id.toNumber(),
        title: updatedParty.title,
        partyTime: updatedParty.partyTime.toNumber(),
        host: updatedParty.host,
        active: updatedParty.active,
        partyClosed: updatedParty.partyClosed,
        winningMovie: updatedParty.winningMovie,
        movieOptions: updatedParty.movieOptions,
        votes: allAddresses, // Add all the voter addresses to the party's votes array
      };

      setParty(formattedUpdatedParty);
      setMovieToVote("");
    } catch (error) {
      console.error("Error voting for movie:", error);
      toast.error("Failed to cast vote. Please try again.");
    } finally {
      setLoadingVote(false);
    }
  };

  const handleCloseParty = async () => {
    if (!contract) return;

    setLoadingClose(true);
    try {
      const transaction = await contract.closeWatchParty(party.id);
      await transaction.wait();
      toast.success("Party closed successfully!");
    } catch (error) {
      console.error("Error closing party:", error);
      toast.error("Failed to close party. Please try again.");
    } finally {
      setLoadingClose(false);
    }
  };

  const handleCheckVotes = async () => {
    if (!contract) return;

    setLoadingCheckVotes(true);
    try {
      const result = await contract.checkVotes(party.id);
      console.log("Check Votes Result:", result);
      setWinningMovie(result[0]);
      setVoteCount(result[1].toNumber());
    } catch (error) {
      console.error("Error checking votes:", error);
      toast.error("Failed to check votes. Please try again.");
    } finally {
      setLoadingCheckVotes(false);
    }
  };

  const handleMintNFT = async () => {
    if (!contract) return;

    setLoadingMintNFT(true);
    try {
      const transaction = await contract.mintNFTForParty(account);
      await transaction.wait();
      toast.success("NFT minted successfully!");
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("Failed to mint NFT. Please try again.");
    } finally {
      setLoadingMintNFT(false);
    }
  };

  const handleDistributeRewards = async () => {
    if (!contract || !rewardAmount || isNaN(rewardAmount)) return;
  
    setLoadingDistributeRewards(true);
    try {
      const votersToReward = party.votes.filter(
        (vote) => vote.movieTitle === party.winningMovie
      );
  
      for (let i = 0; i < votersToReward.length; i++) {
        const voterAddress = votersToReward[i].voterAddress;
        
        const transaction = await contract.distributeReward(
          voterAddress,
          ethers.utils.parseEther(rewardAmount)
        );
        await transaction.wait();
        console.log(`Reward distributed to: ${voterAddress}`);
      }
  
      toast.success("Rewards distributed successfully!");
    } catch (error) {
      console.error("Error distributing rewards:", error);
      toast.error("Failed to distribute rewards. Please try again.");
    } finally {
      setLoadingDistributeRewards(false);
    }
  };
  

  if (loading) {
    return <p>Loading party details...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!party) {
    return <p>No party found.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{party.title}</h1>
      <p className="text-gray-700">Host: {party.host}</p>
      <p className="text-gray-500">
        Party Time: {new Date(party.partyTime * 1000).toLocaleString()}
      </p>

      <p
        className={`font-bold ${
          party.active ? "text-green-500" : "text-red-500"
        }`}
      >
        Status: {party.active ? "Active" : "Closed"}
      </p>

      {party.winningMovie && (
        <p className="text-gray-500">Winning Movie: {party.winningMovie}</p>
      )}
      {party.movieOptions && party.movieOptions.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Vote for a Movie:</h2>
          {!party.partyClosed ? (
            <>
              <select
                value={movieToVote}
                onChange={(e) => setMovieToVote(e.target.value)}
                className="border rounded p-2"
              >
                <option value="">Select a movie</option>
                {party.movieOptions.map((movie, index) => (
                  <option key={index} value={movie}>
                    {movie}
                  </option>
                ))}
              </select>
              <button
                onClick={handleVote}
                disabled={loadingVote || !party.active || party.partyClosed}
                className={`ml-2 p-2 rounded bg-blue-500 text-white ${
                  loadingVote ? "opacity-50" : ""
                }`}
              >
                {loadingVote ? "Voting..." : "Vote"}
              </button>
            </>
          ) : (
            <p className="text-red-500 mt-2">
              Voting has been closed for this party.
            </p>
          )}
        </div>
      )}

      {party.votes && party.votes.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">Voters:</h2>
          <ul className="list-disc list-inside">
            {party.votes.map((vote, index) => (
              <li key={index}>
                Wallet: {vote.voterAddress} voted for {vote.movieTitle}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isHost && party.active && (
        <div className="mt-4">
          <button
            onClick={handleCloseParty}
            disabled={loadingClose}
            className={`p-2 rounded bg-red-500 text-white ${
              loadingClose ? "opacity-50" : ""
            }`}
          >
            {loadingClose ? "Closing..." : "Close Party"}
          </button>
        </div>
      )}

      {party.partyClosed && (
        <div className="mt-4">
          <button
            onClick={handleCheckVotes}
            disabled={loadingCheckVotes}
            className={`p-2 rounded bg-green-500 text-white ${
              loadingCheckVotes ? "opacity-50" : ""
            }`}
          >
            {loadingCheckVotes ? "Checking..." : "Check Votes"}
          </button>
          {winningMovie && (
            <p className="mt-2">
              Winning Movie: {winningMovie} with {voteCount} votes
            </p>
          )}
        </div>
      )}

        {party.partyClosed && (
          <div className="mt-4">
            <button
              onClick={handleMintNFT}
              disabled={loadingMintNFT}
              className={`p-2 rounded bg-pink-500 text-white ${
                loadingMintNFT ? "opacity-50" : ""
              }`}
            >
              {loadingMintNFT ? "Minting..." : "Mint NFT"}
            </button>
          </div>
        )}
        {party.partyClosed && (
  <div className="mt-4">
    <h2 className="text-lg font-semibold">Distribute Rewards</h2>
    
    {/* Input field for reward amount */}
    <input
      type="number"
      min="0"
      step="0.01"
      value={rewardAmount}
      onChange={(e) => setRewardAmount(e.target.value)}
      placeholder="Enter reward amount"
      className="p-2 border border-gray-300 rounded w-full mb-4"
    />

    <button
      onClick={handleDistributeRewards}
      disabled={loadingDistributeRewards || !rewardAmount}
      className={`p-2 rounded bg-yellow-900 text-white ${
        loadingDistributeRewards ? "opacity-50" : ""
      }`}
    >
      {loadingDistributeRewards ? "Distributing..." : "Distribute Rewards"}
    </button>
  </div>
)}

    </div>
  );
};

export default PartyDetails;
