import { expect } from 'chai'
import { ethers } from 'hardhat'
import '@nomiclabs/hardhat-ethers'

import { EthPool__factory, EthPool, RewardToken__factory, RewardToken } from '../build/types'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

const { getContractFactory, getSigners } = ethers

describe('EthPool', () => {
  let ethPool: EthPool
  let rewardToken: RewardToken;

  let signers: SignerWithAddress[];
  let signer1: SignerWithAddress;
  let signer1Addr: string;

  let ethPoolAsSigner1: EthPool;

  beforeEach(async () => {
    // 1
    signers = await getSigners()
    signer1 = signers[1]
    signer1Addr = signer1.address

    // 2
    const ethPoolFactory = (await getContractFactory('EthPool', signers[0])) as EthPool__factory
    ethPool = await ethPoolFactory.deploy()
    await ethPool.deployed()
    const owner = await ethPool.owner()

    // 2.5 
    ethPoolAsSigner1 = await ethPool.connect(signer1)

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
    it('should fail when no stakers', async () => {
      const depositAmt = 100;
      await rewardToken.approve(ethPool.address, depositAmt)

      // @ts-ignore TODO: see why reverted isn't found by typescript
      await expect(ethPool.addReward(depositAmt)).to.be.reverted;
    })

    it('should only allow owner to add', async () => {
      const depositAmt = 100;

      // send some token to signer1
      rewardToken.transfer(signer1Addr, depositAmt)
      const signer1TokenBal = await rewardToken.balanceOf(signer1Addr)
      expect(signer1TokenBal, depositAmt.toString())

      const rewardTokenAsSigner1 = await rewardToken.connect(signer1)
      await rewardTokenAsSigner1.approve(ethPoolAsSigner1.address, 100)

      // @ts-ignore
      await expect(ethPoolAsSigner1.addReward(100)).to.be.reverted;
    })
  })

  // 8
  describe('single user stake', async () => {
    const depositAmt = 100;

    beforeEach(async () => {
      // send some token to signer1
      rewardToken.transfer(signer1Addr, depositAmt)
      const signer1TokenBal = await rewardToken.balanceOf(signer1Addr)
      expect(signer1TokenBal, depositAmt.toString())

      // perform stake
      const rewardTokenAsSigner1 = await rewardToken.connect(signer1)
      await rewardTokenAsSigner1.approve(ethPoolAsSigner1.address, 100)
      await ethPoolAsSigner1.performStake(depositAmt)
    })

    it('should suceed', async () => {
      const addressArr = await ethPoolAsSigner1.getAddressArray()
      const stakeInfo = await ethPoolAsSigner1.stakes(signer1Addr)
      const totalStaked = await ethPoolAsSigner1.totalStaked()

      // shows up in address array & info stored correctly
      expect(addressArr.length).to.eq(1)
      expect(addressArr[0]).to.eq(signer1Addr)
      expect(stakeInfo.stakedAmount.toString()).to.eq(depositAmt.toString())
      expect(totalStaked.toString()).to.eq(depositAmt.toString())
    })

    it('should provide user with rewards when new rewards are added', async () => {
      await rewardToken.approve(ethPool.address, depositAmt)
      await ethPool.addReward(depositAmt)

      const ethPoolRewardBal = await rewardToken.balanceOf(ethPool.address)
      expect(ethPoolRewardBal.toString()).to.eq("200")

      const stakeInfo = await ethPoolAsSigner1.stakes(signer1Addr)
      expect(stakeInfo.stakedAmount.toString()).to.eq("200")
    })
  })

  // 9
  describe('user 1 stakes 100 tokens and user 2 stakes 100 tokens', async () => {
    const depositAmt = 100;
  
    beforeEach(async () => {
      const signer2Addr = signers[2].address
      const ethPoolAsSigner2 = ethPool.connect(signers[2])
      
      // send some token to signer1
      rewardToken.transfer(signer1Addr, depositAmt)
      const signer1TokenBal = await rewardToken.balanceOf(signer1Addr)
      expect(signer1TokenBal, depositAmt.toString())

      // send some token to signer2
      rewardToken.transfer(signer2Addr, depositAmt)
      const signer2TokenBal = await rewardToken.balanceOf(signer2Addr)
      expect(signer2TokenBal, depositAmt.toString())

      // perform stake
      const rewardTokenAsSigner1 = await rewardToken.connect(signer1)
      const rewardTokenAsSigner2 = await rewardToken.connect(signers[2])

      await rewardTokenAsSigner1.approve(ethPoolAsSigner1.address, 100)
      await ethPoolAsSigner1.performStake(depositAmt)

      await rewardTokenAsSigner2.approve(ethPoolAsSigner1.address, 100)
      await ethPoolAsSigner2.performStake(depositAmt)

      // verify
      const stakeInfoSigner1 = await ethPoolAsSigner1.stakes(signer1Addr)
      const stakeInfoSigner2 = await ethPoolAsSigner1.stakes(signer2Addr)

      expect(stakeInfoSigner1.stakedAmount.toString()).to.eq("100")
      expect(stakeInfoSigner2.stakedAmount.toString()).to.eq("100")
    })

    it('add rewards should distribute rewards equally', async () => {
      const signer2Addr = signers[2].address
      
      await rewardToken.approve(ethPool.address, depositAmt)
      await ethPool.addReward(depositAmt)

      const stakeInfoSigner1 = await ethPoolAsSigner1.stakes(signer1Addr)
      const stakeInfoSigner2 = await ethPoolAsSigner1.stakes(signer2Addr)

      expect(stakeInfoSigner1.stakedAmount.toString()).to.eq("150")
      expect(stakeInfoSigner2.stakedAmount.toString()).to.eq("150")
    })

    it('user should be able to withdraw rewards', async () => {
      
    })

    it('user who deposits after addReward should not get old rewards', async () => {

    })

    it('user who deposits after, and new rewards added should get correct amount of rewards', async () => {})
  })
})
