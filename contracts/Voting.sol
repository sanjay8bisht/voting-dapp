// Voting.sol
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string name;
        uint8 voteCount;
    }

    Candidate[] public candidates;
    mapping(address => bool) public voters;
    uint8 public candidatesCount;

    event VoteCasted(address indexed voter, uint candidateId);

    constructor() {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
        addCandidate("Candidate 3");
        addCandidate("Candidate 4");
        addCandidate("Candidate 5");
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates.push(Candidate(_name, 0));
    }

    function vote(uint _candidateId) public {
        require(_candidateId > 0 && _candidateId <= candidatesCount);
        require(!voters[msg.sender], "Already voted");

        candidates[_candidateId].voteCount++;
        voters[msg.sender] = true;

        emit VoteCasted(msg.sender, _candidateId);
    }

    function getCandidates() public view returns (Candidate[] memory) {
        return candidates;
    }

    function getCandidateVotes() public view returns (Candidate[] memory) {
        Candidate[] memory keys = new Candidate[](candidates.length);
        for (uint8 i = 0; i < candidates.length; i++) {
            keys[i] = candidates[i + 1];
        }
        return keys;
    }

    function winner() public view returns (Candidate[] memory) {
        Candidate[] memory topThree = new Candidate[](3);
        Candidate[] memory result = new Candidate[](candidates.length);
        Candidate memory max = candidates[0];
        result[0] = max;
        uint8 index = 1;

        for (uint i = 1; i < candidates.length; i++) {
            if (candidates[i].voteCount > max.voteCount) {
                max = candidates[i];
                delete result;
                result[0] = max;
                index++;
            } else if (candidates[i].voteCount == max.voteCount) {
                result[index] = candidates[i];
                index++;
            }
        }

        for (uint8 i = 0; i < 3; i++) {
            topThree[i] = result[i];
        }
        return topThree;
    }

    function getCandidateVoteCount(
        uint candidateId
    ) public view returns (uint) {
        require(candidateId < candidates.length, "Invalid candidate ID");
        return candidates[candidateId].voteCount;
    }
}
