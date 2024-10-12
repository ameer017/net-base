// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NetBase is ERC721 {
    address public owner;
    IERC20 public rewardToken;
    uint256 public totalSupply;

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
        mapping(string => address[]) voters;
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
    string private _baseTokenURI;

    event WatchPartyCreated(
        uint256 partyId,
        address host,
        string title,
        uint256 time
    );
    event VoteCasted(address indexed voter, uint256 partyId, string movie);
    event WatchPartyClosed(uint256 partyId, string winningMovie);
    event NFTMinted(address indexed participant, uint256 tokenId);
    event RewardsDistributed(
        uint256 partyId,
        address[] winners,
        uint256 rewardPerParticipant
    );

    constructor(address _rewardToken) ERC721("NetBase", "NBT") {
        owner = msg.sender;
        rewardToken = IERC20(_rewardToken);
        totalSupply = 0;
    }

    modifier partyClosed(uint256 _partyId) {
        require(
            watchParties[_partyId].partyClosed,
            "Party must be closed to perform this action"
        );
        _;
    }

    function generatePartyId() internal view returns (uint256) {
        return partyIds.length + 1;
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

    function getWatchParty(
        uint256 _partyId
    )
        public
        view
        returns (WatchPartyView memory party, address[] memory voters)
    {
        WatchParty storage partyData = watchParties[_partyId];

        require(partyData.partyClosed, "Party must be closed to check results");

        party = WatchPartyView({
            id: partyData.id,
            title: partyData.title,
            partyTime: partyData.partyTime,
            host: partyData.host,
            active: partyData.active,
            partyClosed: partyData.partyClosed,
            winningMovie: partyData.winningMovie,
            movieOptions: partyData.movieOptions
        });

        voters = partyData.voters[partyData.winningMovie];
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
        require(bytes(_movieTitle).length > 0, "Invalid movie title");

        party.votes[_movieTitle]++;
        party.hasVoted[msg.sender] = true;
        party.voters[_movieTitle].push(msg.sender);

        emit VoteCasted(msg.sender, _partyId, _movieTitle);
    }

    function closeWatchParty(uint256 _partyId) public {
        WatchParty storage party = watchParties[_partyId];

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

    function distributeRewards(uint256 _partyId) public partyClosed(_partyId) {
        WatchParty storage party = watchParties[_partyId];

        address[] memory winners = party.voters[party.winningMovie];
        uint256 rewardAmount = 5 * (10 ** 18);

        require(winners.length > 0, "No winners to distribute rewards");

        for (uint256 i = 0; i < winners.length; i++) {
            rewardToken.transfer(winners[i], rewardAmount);
        }

        emit RewardsDistributed(_partyId, winners, rewardAmount);
    }

    function mintNFTs(uint256 _partyId) public partyClosed(_partyId) {
        WatchParty storage party = watchParties[_partyId];

        address[] memory participants = party.voters[party.winningMovie];
        for (uint256 i = 0; i < participants.length; i++) {
            totalSupply++;
            _mint(participants[i], totalSupply);
            emit NFTMinted(participants[i], totalSupply);
        }
    }

    function getTokenOwner(uint256 _tokenId) public view returns (address) {
        return ownerOf(_tokenId);
    }

    function setBaseURI(string memory baseURI) public {
        require(
            msg.sender == owner,
            "Only the contract owner can set the base URI"
        );
        _baseTokenURI = baseURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        return string(abi.encodePacked(_baseTokenURI, uint2str(tokenId)));
    }

    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        j = _i;
        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + (j % 10)));
            j /= 10;
        }
        return string(bstr);
    }

    function checkVotes(
        uint256 partyId
    ) public view returns (string memory winningMovie, uint256 count) {
        WatchParty storage party = watchParties[partyId];

        require(party.partyClosed, "Party must be closed to check votes");

        uint256 highestVotes = 0;

        for (uint256 i = 0; i < party.movieOptions.length; i++) {
            string memory currentMovie = party.movieOptions[i];
            uint256 currentVotes = party.votes[currentMovie];

            if (currentVotes > highestVotes) {
                highestVotes = currentVotes;
                winningMovie = currentMovie;
            }
        }

        count = highestVotes;
    }
}
