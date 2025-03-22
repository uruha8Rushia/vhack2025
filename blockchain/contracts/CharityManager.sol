// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CharityManager is Ownable {
    
    struct Charity {
        string name;
        uint256 goal;
        uint256 fundsRaised;
        uint256 deadline;
        bool fundsReleased;
    }

    struct Donation {
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    uint256 public charityCount;
    mapping(uint256 => Charity) public charities;
    mapping(uint256 => Donation[]) public donationsByCharity;

    event CharityCreated(uint256 indexed charityId, string name, uint256 goal, uint256 deadline);
    event DonationReceived(uint256 indexed charityId, address donor, uint256 amount, uint256 timestamp);
    event FundsReleased(uint256 indexed charityId, uint256 amount);
    event RefundClaimed(uint256 indexed charityId, address donor, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function createCharity(string memory _name, uint256 _goal, uint256 _durationDays) external onlyOwner {
        uint256 deadline = block.timestamp + (_durationDays * 1 days);
        charities[charityCount] = Charity(_name, _goal, 0, deadline, false);
        emit CharityCreated(charityCount, _name, _goal, deadline);
        charityCount++;
    }

    function donate(uint256 _charityId) external payable {
        require(_charityId < charityCount, "Invalid charity ID");
        Charity storage charity = charities[_charityId];
        require(block.timestamp < charity.deadline, "Donation period ended");
        
        charity.fundsRaised += msg.value;
        donationsByCharity[_charityId].push(Donation({
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        emit DonationReceived(_charityId, msg.sender, msg.value, block.timestamp);
    }

    function releaseFunds(uint256 _charityId) external onlyOwner {
        Charity storage charity = charities[_charityId];
        require(block.timestamp >= charity.deadline, "Deadline not reached");
        require(charity.fundsRaised >= charity.goal, "Goal not met");
        require(!charity.fundsReleased, "Funds already released");

        charity.fundsReleased = true;
        payable(owner()).transfer(charity.fundsRaised);
        emit FundsReleased(_charityId, charity.fundsRaised);
    }

    function claimRefund(uint256 _charityId) external {
        Charity storage charity = charities[_charityId];
        require(block.timestamp >= charity.deadline, "Deadline not reached");
        require(charity.fundsRaised < charity.goal, "Goal was met");
        require(!charity.fundsReleased, "Funds already released");

        uint256 totalRefund = 0;
        for(uint256 i = 0; i < donationsByCharity[_charityId].length; i++) {
            if(donationsByCharity[_charityId][i].donor == msg.sender) {
                totalRefund += donationsByCharity[_charityId][i].amount;
                donationsByCharity[_charityId][i].amount = 0;
            }
        }

        require(totalRefund > 0, "No donations to refund");
        payable(msg.sender).transfer(totalRefund);
        emit RefundClaimed(_charityId, msg.sender, totalRefund);
    }

    function getDonations(uint256 _charityId) external view returns (Donation[] memory) {
        return donationsByCharity[_charityId];
    }
}