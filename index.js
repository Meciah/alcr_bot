var waxjs = require("@waxio/waxjs/dist");
var io = require('socket.io-client');
// var socket = io.connect('https://alcor.exchange', {reconnect: true});
// socket.on('connect', () => {
//   console.log('socket connected');
//   console.log(socket);
// });
const { TaskTimer } = require('tasktimer');
var express = require('express');
// var request = require('request');
var app = express();
app.use(express.static(__dirname + '/public')); //__dir and not _dir
app.use(express.urlencoded({extended: true}));
app.use(express.json())
var port = process.env.PORT || 6969; 
const { JsonRpc } = require('eosjs');




app.listen(port, () => {console.log('server on' + port)});