const {BN, ether, constants, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');

const multiSignWalletContract = artifacts.require('Multisignwallet');

contract('MultisignWallet Testing', async([alice, bob, admin, dev, minter]) => {
  let multiSignWallet;
  let oneEther = new ether(new BN(1));
  
  beforeEach(async ()=>{
    multiSignWallet = await multiSignWalletContract.new([alice, bob, admin], 2);  
    // multiSignWallet =   await multiSignWalletContract.deployed();
    //  console.log('addressTest--> ', multiSignWallet.address)
     await multiSignWallet.sendTransaction({from: alice,to: multiSignWallet.address, value: oneEther})
  });

  it('Contract Have 1 Ether', async () => {
    const walletBal = await web3.eth.getBalance(multiSignWallet.address);
    assert.equal(walletBal, oneEther);
  });

  it.only('Contract receive ethereum event', async () =>{

    //Bob sent transaction to the contract
    // const receipt =  await multiSignWallet.sendTransaction({from: bob, to: multiSignWallet.address, value: oneEther});
    
    //Alice sent transaction to the contract
    const receipt =  await multiSignWallet.send(web3.utils.toWei('1', "ether"));

    expectEvent(receipt,'SmartContractReceivedEth', {sender: bob, amount: oneEther, message:'Smart contract received ETHEREUM'})
  });



  it('Test getApproverList function', async ()=>{
     const approveList = await multiSignWallet.getApproverList();
     assert.equal(approveList.length, 3);
  });

  it('Test getTransactionList function', async () => {
    const transactionList = await multiSignWallet.getTransactionList();
    assert.equal(transactionList.length, 0);
  });  

  it('Test createTransaction function', async () => {
    await multiSignWallet.createTransaction(oneEther, bob);
    const transactionList = await multiSignWallet.getTransactionList();
    assert.equal(transactionList.length, 1);
    assert.equal(transactionList[0].id, 0);
    assert.equal(transactionList[0].amount, oneEther);
    assert.equal(transactionList[0].to, bob);
    assert.equal(transactionList[0].noApproval, 0);
    assert.equal(transactionList[0].sent, false);
  });

  it('Test createTransaction function emit event', async () => {
    const createTrans = await multiSignWallet.createTransaction(oneEther, bob);
    expectEvent(createTrans, 'CreatedTransaction', {transactionId:'1', message:'Transaction was added to the queue'});
  });

  it('Test approveTransaction function', async () => {
    const adminBalanceBefore = await web3.eth.getBalance(admin);
    await multiSignWallet.createTransaction(oneEther, admin);
    await multiSignWallet.approveTransaction(0, {from: alice});
    await multiSignWallet.approveTransaction(0, {from:bob});
    const adminBalanceAfter = await web3.eth.getBalance(admin);
    assert.equal(adminBalanceAfter-adminBalanceBefore, oneEther);
  });

  it('Test only approval modifier for createTransaction', async ()=>{
    await expectRevert(multiSignWallet.createTransaction(oneEther, bob, {from :dev}), 'Only approve address allowed');
  });

  it('Test only approval modifier for approveTransaction', async ()=>{
    await multiSignWallet.createTransaction(oneEther, admin);
    await expectRevert(multiSignWallet.approveTransaction(0, {from: dev}), 'Only approve address allowed');
  });

  it('Test getBalance function', async() => {
    const contractBalance = await multiSignWallet.getBalance();
    assert.equal(contractBalance.toString(), oneEther);
  });

  //Todo: Continue to check how to test receve() function event
});