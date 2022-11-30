// express import
const express = require("express");
const app = express();
const server = require('http').Server(app);
// winston import
const winston = require("winston");
const log = winston.createLogger();
// socket.io import
const io = require("socket.io")(server);
// jsdom import
const path = require("path");
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
// datauri import
const DatauriParser = require("datauri/parser");
const parser = new DatauriParser();

// phaser Test
app.get("/phaserTest", function(req, res)
{
    res.sendFile(__dirname + "/phaserTest.html");
})

//----------------------------------------------------------------------------------
app.get("/wavewar", function(req, res)
{
    res.sendFile(__dirname + "/wavewar_client.html");
})

//정적 파일 제공
app.use('/static', express.static(__dirname + '/resource'));

function setupAuthoritativePhaser() 
{
    JSDOM.fromFile(path.join(__dirname, 'wavewar_server.html'), 
    {
        runScripts: "dangerously",
        resources: "usable",
        pretendToBeVisual: false
    }).then((dom) => 
    {
        dom.window.gameLoaded = () => 
        {
            server.listen(9999, () => 
            {
                console.log(`포트번호 ${server.address().port}`);
            })
        };
        dom.window.io = io;
        dom.window.URL.createObjectURL = (blob) => 
        {
            if (blob) 
            {
                return parser.format(blob.type, blob[Object.getOwnPropertySymbols(blob)[0]]._buffer).content;
            }
        };    
        dom.window.URL.revokeObjectURL = (objectURL) => { };
    }).catch((error) => 
    {
        console.log(error.message);
    });
}    
setupAuthoritativePhaser();
