
//Remember, by default truffle already have web3, need not to use openzeppelin web3
// const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const multiSignWalletContract = artifacts.require('Multisignwallet');

module.exports = async function (deployer, _network, [alice, bob, admin]) {
  await deployer.deploy(multiSignWalletContract, [alice, bob, admin], 2);
  // await deployer.deploy(multiSignWalletContract, {overwrite:false});
  const _multisignwallet = await multiSignWalletContract.deployed();
  await web3.eth.sendTransaction({from:alice, to: _multisignwallet.address, value: '1000000000000000000'});
};
