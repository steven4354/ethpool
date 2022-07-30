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

    uint256 currentReward = 0;

    constructor() {
        transferOwnership(tx.origin);
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
        //Transfer REWARD
        currentReward = currentReward.add(_rewardAmount);
        rewardToken.transferFrom(msg.sender, address(this), _rewardAmount);
    }
}