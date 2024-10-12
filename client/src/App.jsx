import React from "react";
import { Web3Provider } from "./context/Web3Context";
import Header from "./component/Header";
import { Routes, Route } from "react-router-dom";
import Home from "./component/Home";
import CreateParty from "./pages/CreateParty";
import PartyList from "./component/PartyList";
import PartyDetails from "./component/PartyDetails";
import MyNFTs from "./pages/MyNFTs";

const App = () => {
  return (
    <Web3Provider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateParty />} />
            <Route path="/party-list" element={<PartyList />} />
            <Route path="/my-nfts" element={<MyNFTs />} />
            <Route path="/party-details/:id" element={<PartyDetails />} />
          </Routes>
        </main>
      </div>
    </Web3Provider>
  );
};

export default App;
