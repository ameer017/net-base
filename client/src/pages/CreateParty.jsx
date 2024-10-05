import { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { useNavigate } from "react-router-dom";

const CreateParty = () => {
  const { contract, account } = useContext(Web3Context);
  const [title, setTitle] = useState("");
  const [partyTime, setPartyTime] = useState("");
  const [movieOptions, setMovieOptions] = useState("");
  const [loading, setLoading] = useState(false);
  const [partyId, setPartyId] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const createParty = async (e) => {
    e.preventDefault();

    if (!contract) {
      setError("Smart contract is not initialized!");
      return;
    }

    if (new Date(partyTime) <= new Date()) {
      setError("Party time must be in the future.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const movieList = movieOptions.split(",").map((movie) => movie.trim());

      const partyTimestamp = Math.floor(new Date(partyTime).getTime() / 1000);

      const tx = await contract.createWatchParty(
        title,
        partyTimestamp,
        movieList
      );
      const receipt = await tx.wait();

      const createdPartyId = receipt.events[0].args[0].toNumber();
      setPartyId(createdPartyId);

      console.log("Created Party Details:", {
        title,
        partyTime: partyTimestamp,
        movieOptions: movieList,
        partyId: createdPartyId,
      });

      console.log(`Party created successfully! Party ID: ${createdPartyId}`);

      setTitle("");
      setPartyTime("");
      setMovieOptions("");

      navigate("/party-list");
    } catch (error) {
      console.error("Error creating party:", error);
      setError("Failed to create the party. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">
            Create a Watch Party
      </h1>
      
      <form className="w-full max-w-lg" onSubmit={createParty}>
        <input
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          type="text"
          placeholder="Party Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={loading}
        />
        <input
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          type="datetime-local"
          placeholder="Party Time"
          value={partyTime}
          onChange={(e) => setPartyTime(e.target.value)}
          required
          disabled={loading}
        />
        <input
          className="w-full mb-4 p-2 border border-gray-300 rounded"
          type="text"
          placeholder="Movie Options (comma-separated)"
          value={movieOptions}
          onChange={(e) => setMovieOptions(e.target.value)}
          required
          disabled={loading}
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Party"}
        </button>
      </form>
      {error && <p className="text-red-500 mt-4">{error}</p>}{" "}
    </div>
  );
};

export default CreateParty;
