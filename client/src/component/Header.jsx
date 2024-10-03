import React, { useContext } from "react";
import { Web3Context } from "../context/Web3Context";

const Header = () => {
  const { account } = useContext(Web3Context);

  return (
    <header className="bg-blue-600 p-4 flex justify-between items-center text-white">
      <h1 className="text-xl font-bold">Scroll Chill</h1>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <a href="/" className="hover:underline">
              Home
            </a>
          </li>
          <li>
            <a href="/create" className="hover:underline">
              Create Watch Party
            </a>
          </li>
          <li>
            <a href="/party-list" className="hover:underline">
              PartyList
            </a>
          </li>
        </ul>
      </nav>
      <div>
        {account ? (
          <span className="text-sm">
            Connected: {account.substring(0, 6)}...
            {account.substring(account.length - 4)}
          </span>
        ) : (
          <span className="text-sm">Not connected</span>
        )}
      </div>
    </header>
  );
};

export default Header;
