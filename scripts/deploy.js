const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const rewardTokenAddress = process.env.REWARD_TOKEN_ADDRESS;
  if (!rewardTokenAddress) {
    throw new Error("Please set the REWARD_TOKEN_ADDRESS in your .env file");
  }

  console.log("Using rewardToken address from .env:", rewardTokenAddress);

  const ScrollChillNFT = await ethers.getContractFactory("ScrollChill");
  const scrollChillNFT = await ScrollChillNFT.deploy(rewardTokenAddress);
  await scrollChillNFT.deployed();

  console.log("ScrollChillNFT deployed to:", scrollChillNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
