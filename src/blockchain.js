const CryptoJS = require('crypto-js');

class Block{
    constructor(index, hash, previousHash, timestamp, data){
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
    }
};

const genesisBlock = new Block(
    0,
    "A2C702542A65852E32C68DBF0316CA0063591ACB4A2A6D5A746F5C99F78350BA",
    null,
    1528518691031,
    "This is the genesis!!",
);

let blockchain = [genesisBlock];

const getNewestBlock = () => blockchain[blockchain.length -1];

const getBlockchain = () => blockchain;

const getTimeStamp = () => new Date().getTime() / 1000;

const createHash = (index, previousHash, timestamp, data) => 
    CryptoJS.SHA256(
        index+previousHash+timestamp+JSON.stringify(data)
    ).toString();

const createNewBlock  = data => {
    const previousBlock = getNewestBlock();
    const newBLockIndex = previousBlock.index + 1;
    const newTimestamp = getTimeStamp();
    const newHash = createHash(
        newBLockIndex,
        previousBlock.hash,
        newTimestamp,
        data
    );
    const newBlock = new Block(
        newBLockIndex,
        newHash,
        previousBlock.hash,
        newTimestamp,
        data,
    );
    addBlockToChain(newBlock);
    return newBlock;
};

const getBlocksHash = (block) => createHash(block.index, block.previousHash, block.timestamp, block.data);

const isBlockValid = (candidateBlock, latestBlock) => {
    if(!isBlockStructureValid(candidateBlock)){
        console.log("The candidate structure is not valid");
        return false;
    }else if(latestBlock.index + 1 !== candidateBlock.index){
        console.log("The candidateBlock doesn't have a valid block");
        return false;
    }else if(latestBlock.hash !== candidateBlock.previousHash){
        console.log('The previousHash of the candidateBlock is not the hash of the latestBlock');
        return false;
    }else if(getBlocksHash(candidateBlock) !== candidateBlock.hash){
        console.log("The hash of this block is invalid");
        return false;
    }
    return true;
};

const isBlockStructureValid = (block) => {
    return (
        typeof block.index === 'number' && 
        typeof block.hash === 'string' &&
        typeof block.previousHash === 'string' && 
        typeof block.timestamp === 'number' &&
        typeof block.data === 'string'
    );
};

// Check Chain
const isChainValid = (candidateChain) => {
    const isGenesisValid = block => {
        return JSON.stringify(block) === JSON.stringify(genesisBlock);
    };
    if(!isGenesisValid(candidateChain[0])){
        console.log("The candidateChain's genesisBlock is not the same as our genesisBlock");
        return false;
    };
    // Do not want check genesisBlock, so start index 1
    for (let i = 1; i <candidateChain.length; i++){
        if(!isBlockValid(candidateChain[i],candidateChain[i-1])){
            return false;
        }
    }
    return true;
};

const replaceChain = candidateBlock => {
    if(isChainValid(candidateBlock) && candidateBlock.length > getBlockchain().length){
        blockchain = candidateBlock;
        return true;
    }else{
        return false;
    }
};

const addBlockToChain = candidateBlock => {
    if(isBlockValid(candidateBlock,getNewestBlock())){
        getBlockchain().push(candidateBlock);
        return true;
    }else{
        return false;
    }
}

module.exports = {
	getBlockchain,
	createNewBlock,
	getNewestBlock,
	isBlockValid,
	isBlockStructureValid,
	addBlockToChain,
	replaceChain,
};