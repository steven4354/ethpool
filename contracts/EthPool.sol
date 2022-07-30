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

    uint256 totalStaked;
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
    // TODO: ask if the reward is an erc20
    function setRewardToken(address _reward) public onlyOwner {
        rewardAddress = _reward;
        rewardToken = IERC20(rewardAddress);
    }

    /*
    Add Reward
    */
    // TODO: ask if should add a remove reward
    function addReward(uint256 _rewardAmount) public onlyOwner {
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

        rewardToken.transferFrom(msg.sender, address(this), _amount);
    }
}
