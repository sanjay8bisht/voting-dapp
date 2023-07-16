import React, { useEffect, useState } from "react";
import Web3 from "web3";
import {
  Box,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Divider,
} from "@mui/material";

const VoterForm = ({ votingContract }) => {
  //   const [accountAddress, setAccountAddress] = useState("");
  //   const [winner, setWinner] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);
  const [votingResult, setVotingResult] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [voteCasted, setVoteCasted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const initialize = async () => {
      const web3 = new Web3(window.ethereum);

      // Get the initial selected account
      const accounts = await web3.eth.getAccounts();
      setSelectedAccount(accounts[0]);

      // Listen for account changes in MetaMask
      window.ethereum.on("accountsChanged", handleAccountChange);
    };

    initialize();
    return () => {
      // Clean up the event listener
      window.ethereum.removeListener("accountsChanged", handleAccountChange);
    };
  }, []);

  useEffect(() => {
    (async () => {
      if (votingContract) {
        const candidates = await votingContract.methods.getCandidates().call();
        const _candidates = structToArray(candidates);
        setCandidates([..._candidates]);
        _candidates.sort((a, b) => {
          return Number(b.voteCount) - Number(a.voteCount);
        });
        const votes = _candidates.reduce((total, curr) => total + curr.voteCount, 0);
        setVotingResult(_candidates);
        // setWinner(_candidates.slice(0, 3));
        setTotalVotes(votes);
      }
    })();
  }, [votingContract, voteCasted]);

  const structToArray = (arr) => {
    let newArray = [];
    for (const el of arr) {
      newArray.push({ name: el.name, voteCount: Number(el.voteCount) });
    }
    return newArray;
  };

  const handleAccountChange = (accounts) => {
    setSelectedAccount(accounts[0]);
  };

  const handleCandidateChange = (event) => {
    setSelectedCandidate(event.target.value);
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Perform validation
    if (!selectedCandidate) {
      setErrorMessage("Please select a candidate");
      return;
    }

    // Call the smart contract to cast the vote
    try {
      console.log("selectedAccount", selectedAccount);
      if (selectedAccount in localStorage) {
        setErrorMessage("Already voted");
        return;
      } else {
        await votingContract.methods.vote(selectedCandidate).send({ from: selectedAccount });
        localStorage.setItem(selectedAccount, selectedAccount);
        setVoteCasted(true);
      }
    } catch (error) {
      setErrorMessage("Error casting vote");
      return;
    }
    setSelectedCandidate("");
  };

  return (
    <Box style={{ textAlign: "center" }}>
      <h2>Cast Your Vote for account {selectedAccount}</h2>
      {/* {winner &&
        winner.length > 0 &&
        winner.map((w) => (
          <h2>
            {w.name}({parseInt(w.voteCount)})
          </h2>
        ))} */}
      <Divider />
      <List style={{ width: "50%", margin: "0 auto" }}>
        {votingResult &&
          votingResult.length > 0 &&
          votingResult.map((candidate, index) => {
            return (
              <ListItem key={index} style={{ textAlign: "center" }}>
                <ListItemText primary={candidate.name} />
                <LinearProgress
                  color="primary"
                  variant="determinate"
                  value={(parseInt(candidate.voteCount) / totalVotes) * 100 || 0}
                  sx={{ width: "50%" }}
                />
              </ListItem>
            );
          })}
      </List>
      <Divider />
      <Box p={4}>
        <FormControl onSubmit={handleSubmit}>
          <div style={{ paddingBottom: 30 }}>
            <InputLabel id="demo-simple-select-helper-label">Select a candidate</InputLabel>
            <Select
              value={selectedCandidate}
              onChange={handleCandidateChange}
              label="Select a candidate"
              style={{ width: 200 }}
            >
              {candidates &&
                candidates.length > 0 &&
                candidates.map((candidate, index) => {
                  return (
                    <MenuItem key={index} value={index}>
                      {candidate.name}
                    </MenuItem>
                  );
                })}
            </Select>
          </div>
          {errorMessage && <p>{errorMessage}</p>}
          <Button variant="contained" type="submit" disabled={selectedCandidate ? false : true}>
            Submit Vote
          </Button>
        </FormControl>
      </Box>
    </Box>
  );
};

export default VoterForm;
