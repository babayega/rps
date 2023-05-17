# Real Money Rock-Paper-Scissor

This is a simple Rock-Paper-Scissor game that asks user to deposit betting amount in ETH while
registering. The winner gets the whole amount minus the commission of the house.

It is deployed using the create2 OPCODE of Solidity, hence the smart contract will have same 
address accross chains. Factory pattern is used in which a factory contrct is first deployed
which then deploys the actual RPS contract.

Try running some of the following tasks:

```shell
npx hardhat test ./test/RPS.ts

npx hardhat deploy --network opt_gor --tags RPS_Factory --reset
```
