import { expect } from 'chai'
import { ethers } from 'hardhat'
import '@nomiclabs/hardhat-ethers'

import { EthPool__factory, EthPool } from '../build/types'

const { getContractFactory, getSigners } = ethers

describe('EthPool', () => {
  let ethPool: EthPool

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
  })

  describe('count up', async () => {
    it('should count up', async () => {
      // await counter.countUp()
      // const count = await counter.getCount()
      // expect(count).to.eq(1)
    })
  })

})