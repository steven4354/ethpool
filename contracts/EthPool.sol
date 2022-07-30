// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;
import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract EthPool is Ownable {
    using SafeMath for uint256;

    //Reward Token
    address public rewardAddress;
    IERC20 rewardToken;

    //Staking info
    struct Stake {
        uint256 startTime;
        uint256 stakedAmount;
    }

    uint256 public totalStaked;
    address[] public addressArray;
    mapping(address => Stake) public stakes;

    constructor() {
        transferOwnership(tx.origin);
    }

    function getAddressArray() external view returns (address[] memory) {
        return addressArray;
    }

    /*
    Set Reward Token Contract
    */
    function setRewardToken(address _reward) public onlyOwner {
        rewardAddress = _reward;
        rewardToken = IERC20(rewardAddress);
    }

    /*
    Add Reward
    */
    function addReward(uint256 _rewardAmount) public onlyOwner {
        require(totalStaked > 0, "no stakers yet, come back to add/distribute rewards when users have staked");

        for (uint256 i = 0; i < addressArray.length; i++) {
            address stakerAddr = addressArray[i];
            Stake storage stake = stakes[stakerAddr];

            // TODO: amounts smaller than supported precision will result to 0 rewards
            // check if results in any dust settling in the smart contract. perhaps onlyOwner withdraw func to retrieve
            uint256 numerator = stake.stakedAmount.mul(_rewardAmount);
            uint256 rewardAmtToDistr = numerator.div(totalStaked);
            stake.stakedAmount = stake.stakedAmount.add(rewardAmtToDistr);
        }

        // update total staked
        totalStaked = totalStaked.add(_rewardAmount);

        rewardToken.transferFrom(msg.sender, address(this), _rewardAmount);
    }

    /*
    User stake
    */
    function performStake(uint256 _amount) public {
        Stake storage stake = stakes[msg.sender];

        // add to address array if not there yet
        if (stake.startTime == 0) {
            stake.startTime = block.timestamp;
            addressArray.push(msg.sender);
        }

        // update the amount
        stake.stakedAmount = stake.stakedAmount.add(_amount);

        // update total staked
        totalStaked = totalStaked.add(_amount);

        rewardToken.transferFrom(msg.sender, address(this), _amount);
    }

    /*
    User withdraw
    */
    function unstake(uint256 _amount) public {
        Stake storage stake = stakes[msg.sender];

        // Update state
        stake.stakedAmount = stake.stakedAmount.sub(_amount);
        require(stake.stakedAmount >= 0, "withdrawal amount too high");

        rewardToken.approve(address(this), _amount);
        rewardToken.transfer(msg.sender, _amount);
    }
}
