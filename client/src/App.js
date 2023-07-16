import React, { useEffect, useState } from "react";
import Web3 from "web3";

import VoterForm from "./VoterForm";
import VotingContract from "./contracts/Voting.json";

import "./App.css";

function App() {
  const [contractInstance, setContractInstance] = useState(null);
  useEffect(() => {
    const initialize = async () => {
      // Create a Web3 instance
      if (window.ethereum) {
        await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        window.web3 = window.ethereum;
      } else if (window.web3) {
        await window.web3.currentProvider.enable();
        window.web3 = window.web3.currentProvider;
      } else {
        console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
      }

      const web3 = new Web3(window.web3);
      const votingContract = new web3.eth.Contract(
        VotingContract.abi,
        process.env.REACT_APP_CONTRACT_ADDRESS
      );
      setContractInstance(votingContract);
    };

    initialize();
  }, []);

  return (
    <div className="App">
      <div>
        <h1>Decentralized Voting Application</h1>
        <VoterForm votingContract={contractInstance} />
      </div>
    </div>
  );
}

export default App;
