import React from "react";

const Home = () => {
  return (
    <div className="bg-gradient-to-b from-blue-900 to-black text-white min-h-[92vh] flex flex-col justify-center items-center">
      <section className="text-center p-8">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-float">
          Welcome to <span className="text-blue-500">Net Base</span>
        </h1>
        <p className="text-lg md:text-2xl mb-6 ">
          Join the ultimate decentralized watch party experience on Base
          network. <br />
          Create, watch, and vote for your preferred movies in a watch party!
        </p>
        <div className="mt-8">
          <p className=" text-white py-3 px-6 rounded-full text-lg md:text-xl">
            Connect Your Wallet And Start Watching!
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
