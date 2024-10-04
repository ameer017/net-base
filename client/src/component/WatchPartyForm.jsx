import React, { useState } from "react";
import { useContract } from "../util/useContract";

const WatchPartyForm = () => {
  const contract = useContract();
  const [title, setTitle] = useState("");
  const [partyTime, setPartyTime] = useState("");
  const [movieOptions, setMovieOptions] = useState([""]);

  const handleCreateParty = async () => {
    try {
      const tx = await contract.createWatchParty(
        title,
        Date.parse(partyTime) / 1000,
        movieOptions
      );
      await tx.wait();
      alert("Watch Party Created!");
    } catch (error) {
      console.error(error);
      alert("Failed to create watch party");
    }
  };

  return (
    <form>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <input
        type="datetime-local"
        value={partyTime}
        onChange={(e) => setPartyTime(e.target.value)}
      />
      <button type="button" onClick={handleCreateParty}>
        Create Party
      </button>
    </form>
  );
};

export default WatchPartyForm;
