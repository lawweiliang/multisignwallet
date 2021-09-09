const {BN, constants, expectEvent, expectRevert} = require('@openzeppelin/test-helpers');

const multiSignWalletContract = artifacts.require('Multisignwallet');

contract('MultisignWallet Testing', async([alice, bob, admin, dev, minter]) => {
  let multiSignWallet;
  let oneEther = '1000000000000000000';
  
  beforeEach(async ()=>{
    multiSignWallet = await multiSignWalletContract.new([alice, bob, admin], 2);  
    // multiSignWallet =   await multiSignWalletContract.deployed();
    //  console.log('addressTest--> ', multiSignWallet.address)
     await web3.eth.sendTransaction({from: alice,to: multiSignWallet.address, value: oneEther})
  });

  it.only('Contract Have 1 Ether', async () => {
    const walletBal = await web3.eth.getBalance(multiSignWallet.address);
    // assert.equal(walletBal, oneEther);
    // assert.equal(walletBal, '2');
    assert(walletBal == '2');
  });

/*   it.only('Contract receive ethereum event', async () =>{
    const receipt = await web3.eth.sendTransaction({from: bob, to: multiSignWallet.address, value: oneEther})
    .on('confirmation', (confirmNo, receipt)=>{

      console.log('confirmNo', confirmNo);
      console.log('receipt', receipt);
    });
    // const receiptDetail = await web3.eth.getTransactionReceipt(receipt.transactionHash);


    console.log('receptTest', receipt);
    // console.log('receiptDetail', receiptDetail);

    expectEvent(receipt, 'SmartContractReceivedEth');
  });
  */

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


  it.only('Test approveTransaction function', async () => {
    const adminBalanceBefore = await web3.eth.getBalance(admin);
    await multiSignWallet.createTransaction(oneEther, admin);
    await multiSignWallet.approveTransaction(0, {from: alice});
    await multiSignWallet.approveTransaction(0, {from:bob});
    const adminBalanceAfter = await web3.eth.getBalance(admin);
    assert.equal(adminBalanceAfter-adminBalanceBefore, oneEther);
  });

  it('Test getBalance function', async() => {
    const contractBalance = await multiSignWallet.getBalance();
    assert.equal(contractBalance.toString(), oneEther);
  });

  //Todo: Continue to check how to test receve() function event
  //Todo: Test only Approval Function for both approve transaction and create transaction
});