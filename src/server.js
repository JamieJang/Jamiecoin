const express = require('express'),
    bodyParser = require('body-parser'),
    morgan = require("morgan"),
    BlockChain = require("./blockchain");

const { getBlockchain, createNewBlock } = BlockChain;

const PORT = 3000;

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));

app.get("/blocks",(req,res) => {
    res.send(getBlockchain());
});

app.post("/blocks", (req,res) => {
    const { body:{data} } = req;
    const newBlock = createNewBlock(data);
    res.send(newBlock);
})


app.listen(PORT, () => console.log(`Jamiecoin Server running on ${PORT}`));

