// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NetBase is ERC721 {
    address public owner;
    IERC20 public rewardToken;

    struct WatchParty {
        uint256 id;
        string title;
        uint256 partyTime;
        address host;
        bool active;
        bool partyClosed;
        string[] movieOptions;
        mapping(address => bool) hasVoted;
        mapping(string => uint256) votes;
        string winningMovie;
    }

    struct WatchPartyView {
        uint256 id;
        string title;
        uint256 partyTime;
        address host;
        bool active;
        bool partyClosed;
        string winningMovie;
        string[] movieOptions;
    }

    mapping(uint256 => WatchParty) private watchParties; 
    uint256[] private partyIds;

    event WatchPartyCreated(
        uint256 partyId,
        address host,
        string title,
        uint256 time
    );
    event VoteCast(uint256 partyId, string movieTitle, address voter);
    event WatchPartyClosed(uint256 partyId, string winningMovie);
    event NFTMinted(address to, uint256 tokenId);

    constructor(address _rewardToken) ERC721("ScrollChillNFT", "SCNFT") {
        owner = msg.sender;
        rewardToken = IERC20(_rewardToken);
    }

    function generatePartyId() internal view returns (uint256) {
        return partyIds.length + 1; 
    }

    function generateTokenId(
        address participant
    ) internal view returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(
                        participant,
                        block.timestamp,
                        block.prevrandao
                    )
                )
            );
    }

    function createWatchParty(
        string memory _title,
        uint256 _partyTime,
        string[] memory _movieOptions
    ) public {
        require(
            _partyTime > block.timestamp,
            "Party time must be in the future"
        );

        uint256 newPartyId = generatePartyId();

        WatchParty storage newParty = watchParties[newPartyId];
        newParty.id = newPartyId;
        newParty.title = _title;
        newParty.partyTime = _partyTime;
        newParty.host = msg.sender;
        newParty.active = true;
        newParty.partyClosed = false;
        newParty.movieOptions = _movieOptions;

        partyIds.push(newPartyId); 

        emit WatchPartyCreated(newPartyId, msg.sender, _title, _partyTime);
    }

    function getAllParties() public view returns (WatchPartyView[] memory) {
        WatchPartyView[] memory parties = new WatchPartyView[](partyIds.length);
        for (uint256 i = 0; i < partyIds.length; i++) {
            WatchParty storage party = watchParties[partyIds[i]];
            parties[i] = WatchPartyView({
                id: party.id,
                title: party.title,
                partyTime: party.partyTime,
                host: party.host,
                active: party.active,
                partyClosed: party.partyClosed,
                winningMovie: party.winningMovie,
                movieOptions: party.movieOptions
            });
        }
        return parties;
    }

    function voteForMovie(uint256 _partyId, string memory _movieTitle) public {
        WatchParty storage party = watchParties[_partyId];

        require(block.timestamp < party.partyTime, "Voting period is over");
        require(party.active, "This watch party is no longer active");
        require(!party.hasVoted[msg.sender], "You have already voted");

        party.votes[_movieTitle]++;
        party.hasVoted[msg.sender] = true;

        emit VoteCast(_partyId, _movieTitle, msg.sender);
    }

    function closeWatchParty(uint256 _partyId) public {
        WatchParty storage party = watchParties[_partyId];

        require(msg.sender == party.host, "Only the host can close the party");
        require(party.active, "Party is already closed");

        party.active = false;
        party.partyClosed = true;

        string memory winningMovie = party.movieOptions[0];
        uint256 highestVotes = party.votes[winningMovie];

        for (uint256 i = 1; i < party.movieOptions.length; i++) {
            string memory currentMovie = party.movieOptions[i];
            uint256 currentVotes = party.votes[currentMovie];
            if (currentVotes > highestVotes) {
                winningMovie = currentMovie;
                highestVotes = currentVotes;
            }
        }

        party.winningMovie = winningMovie;

        emit WatchPartyClosed(_partyId, winningMovie);
    }

    function checkVotes(
        uint256 _partyId
    ) public view returns (string memory movieTitle, uint256 voteCount) {
        WatchParty storage party = watchParties[_partyId];

        require(party.partyClosed, "Party must be closed to check results");

        return (party.winningMovie, party.votes[party.winningMovie]);
    }

    function mintNFTForParty(address participant) public returns (uint256) {
        return _mintNFTForParty(participant);
    }

    function _mintNFTForParty(address participant) internal returns (uint256) {
        uint256 newTokenId = generateTokenId(participant);
        _mint(participant, newTokenId);
        emit NFTMinted(participant, newTokenId);
        return newTokenId;
    }

    function distributeRewards(
        address _host,
        address[] memory _participants,
        uint256 _rewardAmount
    ) public {
        require(
            _participants.length > 0,
            "No participants to distribute rewards"
        );
        require(_rewardAmount > 0, "Reward amount must be greater than zero");

        rewardToken.transfer(_host, _rewardAmount);

        uint256 rewardPerParticipant = _rewardAmount / _participants.length;
        for (uint256 i = 0; i < _participants.length; i++) {
            rewardToken.transfer(_participants[i], rewardPerParticipant);
        }
    }
}
