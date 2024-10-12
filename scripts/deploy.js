const { ethers } = require("hardhat");
require("dotenv").config();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // const initialSupply = ethers.utils.parseUnits("1000000", 18);

  // const RewardToken = await ethers.getContractFactory("RewardToken");
  // const rewardToken = await RewardToken.deploy(initialSupply);
  // await rewardToken.deployed();
  // console.log("RewardToken deployed to:", rewardToken.address);

  const NetBase = await ethers.getContractFactory("NetBase");
  const netBase = await NetBase.deploy(process.env.REWARD_TOKEN_ADDRESS);
  await netBase.deployed();

  console.log("NetBase deployed to:", netBase.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
