const WebSockets = require('ws');

// share same websocket server peer's array
const sockets = [];

const getSockets = () => sockets;

// P2P server start function
const startP2PServer = server => {
    const wsServer = new WebSockets.Server({ server });
    wsServer.on("connection", ws => {
        initSocketConnection(ws);
    });
    console.log("Jamiecoin P2P Server running");
};

const initSocketConnection = socket => {
    sockets.push(socket);
    socket.on("message",(data) => {
        console.log(data);
    });
    setTimeout(() => {
       socket.send("Welcome"); 
    }, 5000);
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