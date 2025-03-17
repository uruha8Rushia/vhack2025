// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CharityManager is Ownable {
    struct Charity {
        string name;
        uint256 goal;
        uint256 fundsRaised;
        bool fundsReleased;
    }

    uint256 public charityCount;
    mapping(uint256 => Charity) public charities;

    event CharityCreated(uint256 indexed charityId, string name, uint256 goal);
    event DonationReceived(uint256 indexed charityId, address donor, uint256 amount);
    event FundsReleased(uint256 indexed charityId, uint256 amount);

    // Initialize Ownable with the deployer as the owner
    constructor() Ownable(msg.sender) {}

    // Create a new charity (admin-only)
    function createCharity(string memory _name, uint256 _goal) external onlyOwner {
        charities[charityCount] = Charity(_name, _goal, 0, false);
        emit CharityCreated(charityCount, _name, _goal);
        charityCount++;
    }

    // Donate to a charity
    function donate(uint256 _charityId) external payable {
        require(_charityId < charityCount, "Invalid charity ID");
        Charity storage charity = charities[_charityId];
        charity.fundsRaised += msg.value;
        emit DonationReceived(_charityId, msg.sender, msg.value);
    }

    // Release funds to charity owner when goal is met (admin-only)
    function releaseFunds(uint256 _charityId) external onlyOwner {
        Charity storage charity = charities[_charityId];
        require(charity.fundsRaised >= charity.goal, "Goal not met");
        require(!charity.fundsReleased, "Funds already released");

        charity.fundsReleased = true;
        payable(owner()).transfer(charity.fundsRaised);
        emit FundsReleased(_charityId, charity.fundsRaised);
    }
}