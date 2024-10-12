import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Web3Context } from "../context/Web3Context";

const PartyList = () => {
  const { contract, error: web3Error } = useContext(Web3Context);
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchParties = async () => {
      if (!contract) return; 

      setLoading(true);
      setFetchError(null);
      try {
        const partiesList = await contract.getAllParties(); 

       
        const formattedParties = partiesList.map((party) => ({
          id: party.id.toNumber(),
          title: party.title,
          partyTime: party.partyTime.toNumber(),
          host: party.host,
          active: party.active,
          partyClosed: party.partyClosed,
          winningMovie: party.winningMovie,
          movieOptions: party.movieOptions || [], 
        }));

        setParties(formattedParties);
      } catch (error) {
        console.error("Error fetching watch parties:", error);
        setFetchError("Could not fetch parties. Please try again later."); 
      } finally {
        setLoading(false);
      }
    };

    fetchParties();
  }, [contract]);

  const formatHost = (host) => {
    if (host.length > 20) {
      return `${host.slice(0, 6)}...${host.slice(-4)}`; 
    }
    return host;
  };

  return (
    <div className="relative">
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Watch Parties Catalogue
        </h1>

        {loading ? (
          <p>Loading parties...</p>
        ) : web3Error || fetchError ? (
          <p className="text-red-500">{web3Error || fetchError}</p>
        ) : parties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parties.map((party) => (
              <Link
                to={`/party-details/${party.id}`}
                key={party.id}
                className="block p-4 border border-gray-300 rounded-lg shadow hover:shadow-lg transition-shadow duration-200"
              >
                <h2 className="text-lg font-semibold">{party.title}</h2>
                <p className="text-gray-700">Host: {formatHost(party.host)}</p>
                <p className="text-gray-500">
                  Party Time:{" "}
                  {new Date(party.partyTime * 1000).toLocaleString()}
                </p>
                <p
                  className={`font-bold ${
                    party.active ? "text-green-500" : "text-red-500"
                  }`}
                >
                  Status: {party.active ? "Active" : "Closed"}
                </p>

                {party.movieOptions && party.movieOptions.length > 0 && (
                  <p className="text-gray-500 my-2">
                    Movie Options: {party.movieOptions.join(", ")}
                  </p>
                )}

                <p className="text-gray-500 my-2 border-t-2">
                  Winning Movie: {party.winningMovie || "No vote yet"}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <p>No more parties available.</p>
        )}
      </div>
    </div>
  );
};

export default PartyList;
