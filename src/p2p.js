const WebSockets = require('ws'),
    BlockChain = require('./blockchain');

const { getBlockchain, getNewestBlock, isBlockStructureValid, addBlockToChain, replaceChain } = BlockChain;

// share same websocket server peer's array
const sockets = [];

// Message Types
const GET_LATEST = "GET_LATEST";
const GET_ALL = "GET_ALL";
const BLOCKCHAIN_RESPONSE = "BLOCKCHAIN_RESPONSE";

// Message Creators
const getLatest = () => {   // when connect, send latest block of thenselves to each peers 
    return {
        type: GET_LATEST,
        data: null,
    };
};
const getAll = () => {
    return{
        type: GET_ALL,
        data: null,
    };
};
const BlockchainResponse = (data) => {
    return {
        type: BLOCKCHAIN_RESPONSE,
        data,
    };
};

const getSockets = () => sockets;

// P2P server start function
const startP2PServer = server => {
    const wsServer = new WebSockets.Server({ server });
    wsServer.on("connection", ws => {
        initSocketConnection(ws);
    });
    console.log("Jamiecoin P2P Server running");
};

const initSocketConnection = ws => {
    sockets.push(ws);
    handleSocketMessages(ws);
    handleSocketError(ws);
    sendMessage(ws,getLatest());
};

const parseData = data => {
    try{
        return JSON.parse(data);
    } catch(e){
        console.log(e);
        return null;
    }
}

const handleSocketMessages = ws => {
    ws.on("message", data => {
        const message = parseData(data);
        if(message === null){
            return;
        }
        console.log(message);
        switch(message.type){
            case GET_LATEST:
                sendMessage(ws,responseLatest());
                break;
            case GET_ALL:
                sendMessage(ws,responseAll());
                break;
            case BLOCKCHAIN_RESPONSE:
                const receivedBlocks = message.data;
                if(receivedBlocks === null){
                    break;
                }
                handleBlockchainResponse(receivedBlocks);
                break;
        }
    })
};

const handleBlockchainResponse = receivedBlocks => {
    if(receivedBlocks.length === 0){
        console.log("Received Blocks have a length of 0")
        return;
    }
    const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    if(!isBlockStructureValid(latestBlockReceived)){
        console.log("The block structure of the block received is not valid");
        return;
    }
    const newestBlock = getNewestBlock();
    if(latestBlockReceived.index > newestBlock.index){
        if(newestBlock.hash === latestBlockReceived.previousHash){
            addBlockToChain(latestBlockReceived);
        }else if(receivedBlocks.length === 1){
            // to do, get all the block, we are waaay behind
            sendMessageToAll(getAll());
        }else{
            replaceChain(receivedBlocks);
        }
    }
}

const sendMessage = (ws,message) => ws.send(JSON.stringify(message));

const sendMessageToAll = message => 
    sockets.forEach(ws => sendMessage(ws,message));

const responseLatest = () => BlockchainResponse( [getNewestBlock()] );

const responseAll = () => BlockchainResponse(getBlockchain());

const handleSocketError = (ws) => {
    const closeSocketConnection = ws => {
        ws.close();
        sockets.splice(sockets.indexOf(ws),1);
    };
    ws.on("close",() => closeSocketConnection(ws));
    ws.on("error", () => closeSocketConnection(ws));
}

const connectToPeers = newPeer => {
    const ws = new WebSockets(newPeer);
    ws.on("open",() => {
        initSocketConnection(ws);
    })
}

module.exports ={
    startP2PServer,
    connectToPeers,
};