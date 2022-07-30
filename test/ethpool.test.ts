import { expect } from 'chai'
import { ethers } from 'hardhat'
import '@nomiclabs/hardhat-ethers'

import { EthPool__factory, EthPool, RewardToken__factory, RewardToken } from '../build/types'

const { getContractFactory, getSigners } = ethers

describe('EthPool', () => {
  let ethPool: EthPool
  let rewardToken: RewardToken;

  beforeEach(async () => {
    // 1
    const signers = await getSigners()

    // 2
    const ethPoolFactory = (await getContractFactory('EthPool', signers[0])) as EthPool__factory
    ethPool = await ethPoolFactory.deploy()
    await ethPool.deployed()
    const owner = await ethPool.owner()

    // 3
    expect(owner).to.eq(signers[0].address)

    // 4
    const rewardTokenFactory = (await ethers.getContractFactory(
      "RewardToken", signers[0]
    )) as RewardToken__factory;
    const totalSupply = (10 ** 9).toString()
    rewardToken = await rewardTokenFactory.deploy(
      ethers.utils.parseEther(totalSupply),
    )

    // 5
    const initSupply = await rewardToken.balanceOf(signers[0].address)
    expect(initSupply.toString()).to.eq('1000000000000000000000000000')

    // 6 set reward
    await ethPool.setRewardToken(rewardToken.address)
    const rewardAddr = await ethPool.rewardAddress()
    expect(rewardToken.address).to.eq(rewardAddr)
  })

  // 7
  describe('add reward', async () => {
    it('should succeed', async () => {
      const depositAmt = 100;
      await rewardToken.approve(ethPool.address, depositAmt)
      await ethPool.addReward(depositAmt)

      const ethPoolRewardBal = await rewardToken.balanceOf(ethPool.address)
      expect(ethPoolRewardBal.toString(), depositAmt.toString())
    })

    it('should only allow owner to add', async () => {
      const depositAmt = 100;
      const signers = await getSigners()
      const signer1 = signers[1]
      const signer1Addr = signers[1].address
      
      // send some token to signer1
      rewardToken.transfer(signer1Addr, depositAmt)
      const signer1TokenBal = await rewardToken.balanceOf(signer1Addr)
      expect(signer1TokenBal, depositAmt.toString())

      const ethPoolAsSigner1 = await ethPool.connect(signer1)
      const rewardTokenAsSigner1 = await rewardToken.connect(signer1)
      await rewardTokenAsSigner1.approve(ethPoolAsSigner1.address, 100)

      // @ts-ignore TODO: see why reverted isn't found by typescript
      await expect(ethPoolAsSigner1.addReward(100)).to.be.reverted;
    })
  })

})
