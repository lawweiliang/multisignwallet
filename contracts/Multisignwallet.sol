// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.7;

contract MultiSignWallet {
 
    uint minNoApproval;
 
    address[] approverList;
    
    mapping(address=>mapping(uint=>bool)) approverTransactionList;


    struct Transaction{
        uint id;
        uint amount;
        address payable to;
        uint noApproval;
        bool sent;
    }
    
    Transaction[] transactionList;
    
    event CreatedTransaction(uint transactionId, string message);
    event TransactionSent(Transaction transaction, string message);
    event SmartContractReceivedEth(address sender, uint amount, string message);

    constructor(address[] memory _approverList, uint _minNoApproval){
        approverList = _approverList;
        minNoApproval = _minNoApproval;
    }
    

    function getApproverList() public view returns(address[] memory){
        return approverList;
    }
    
    function getTransactionList() public view returns(Transaction[] memory){
        return transactionList;
    } 
    
    
    function createTransaction(uint _amount, address payable _to) public onlyApproval{
        transactionList.push(
          Transaction(transactionList.length, _amount, _to, 0, false) 
        );
        
        //here need to emit a successfully create transaction
        emit CreatedTransaction(transactionList.length, 'Transaction was added to the queue');
   
    }
    
    
    function approveTransaction(uint _transactionId) public onlyApproval{
        require(transactionList[_transactionId].sent == false, "Transaction had been sent");
        require(approverTransactionList[msg.sender][_transactionId] == false, "Cannot approve transfer twice");
    
        approverTransactionList[msg.sender][_transactionId] = true;
        transactionList[_transactionId].noApproval++;
        
        if(transactionList[_transactionId].noApproval >= minNoApproval){
            transactionList[_transactionId].to.transfer(transactionList[_transactionId].amount);
            transactionList[_transactionId].sent = true;
            
            //emit an transfer succesfully event
            emit TransactionSent(transactionList[_transactionId], 'Transaction was sent');
        }
    }
    
    modifier onlyApproval(){
        
        bool allowed = false;
        for(uint i=0; i<approverList.length; i++){
            if(approverList[i] == msg.sender){
              allowed = true;
            }
        }
      
         require(allowed==true, "Only approve address allowed");
        _;
    }
    
    
    receive() external payable{
        emit SmartContractReceivedEth(msg.sender, msg.value, "Smart contract received ETHEREUM");
    }
    
    function getBalance() external view returns(uint){
        return address(this).balance;
    }
    
    // function invest() external payable{
    //     emit SmartContractReceivedEth(msg.sender, msg.value, "Smart contract received ETHEREUM");
    // }
    
}