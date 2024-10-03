# Scroll and Chill

## Description

The **Scroll and Chill** allows users to host, participate in, and vote on movie selections during a watch party. This platform leverages Scroll blockchain to ensure secure transactions and transparency, providing a unique social experience for movie lovers.

## Features

- **Host Watch Parties:** Create and manage your own watch parties.
- **Vote for Movies:** Participate by voting for your favorite movie options.
- **Close Parties and Check Votes:** Hosts can close the party and check the results after voting ends.

## Video Demo

[![Watch Party Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://youtu.be/o6YlHePRAC8)

_Click the image above to watch the demo video showcasing the functionalities of the watch party application._

_Explore the source code and contribute to the project!_

## Smart Contract

- **Deployed on Scroll:** [Contract Address](0x8911c0889252dcf9862256feb89Ed0Fa7d3c1fd4)
- **Verified Contract on Scroll scan:** [ScrollScan Link](https://sepolia.scrollscan.com/address/0x5362d3E9A59aE8265590871D5E5cCcb1475d99C8)

_The smart contract is responsible for handling party functionalities, voting._

## Alchemy RPC Integration

The project utilizes Alchemy RPC for efficient communication with the Ethereum blockchain. Below is the configuration snippet used in the project.

### Hardhat Config Example

```javascript
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");

module.exports = {
  solidity: "0.8.20",
  networks: {
    scrollTestnet: {
      url: process.env.ALCHEMY_API_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
    },
  },

  etherscan: {
    apiKey: {
      scrollSepolia: process.env.SCROLLSCAN_API_KEY,
    },
    customChains: [
      {
        network: "scrollSepolia",
        chainId: 534351,
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com/",
        },
      },
    ],
  },
};
```
