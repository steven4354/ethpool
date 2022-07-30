# EthPool

## Summary
ETHPool provides a service where people can deposit ETH and they will receive rewards proportional to their deposits in the pool. Users must be able to take out their deposits along with their portion of rewards at any time. New rewards are deposited manually into the pool by the ETHPool team using a contract function.

## Requirements
Only the team can deposit rewards.
The team can deposit rewards at any time.
Deposited rewards go to the pool of users, not to individual users.
Users should be able to withdraw their deposits along with their share of rewards considering the time when they deposited. They should not get rewards for the ones distributed before their deposits.

## Getting started

```bash
yarn
yarn test
```
