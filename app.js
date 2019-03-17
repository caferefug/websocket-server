'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const mysql = require('mysql');
const connection = mysql.createConnection({
  host     : 'public.2it8h.tyo1.database-hosting.conoha.io',
  user     : '2it8h_developer',
  password : 'Line123456789'
});
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});
connection.query('USE 2it8h_development');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });


wss.on('connection', (ws) => {
    let tero_id = -1;
    let beacon_id = -1;

    const sendMessage = (msg) => {
        // Wait until the state of the socket is not ready and send the message when it is...
        waitForSocketConnection(ws, function(){
            ws.send(msg);
        });
    };

    // Make the function wait until the connection is made...
    const waitForSocketConnection = (socket, callback) => {
        setTimeout(
            function () {
                if (socket.readyState === 1) {
                    console.log("Connection is made")
                    if(callback != null){
                        callback();
                    }
                    return;
                } else {
                    waitForSocketConnection(socket, callback);
                }
            }, 5); // wait 5 milisecond for the connection...
    };

    console.log('Client connected');
    ws.on('close', () => console.log('Client disconnected'));

    ws.on('message', msg => {
        if (msg.split(' ')[0] === "tero_id") {
            tero_id = msg.split(' ')[1]; 
        }
        if (msg.split(' ')[0] === "beacon_id") {
            beacon_id = msg.split(' ')[1]; 
        }
    });

    setInterval(() => {
        connection.query(`SELECT id FROM Targets WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR) AND beacon_id='01270a4686'`, function (error, results, fields) {
            // 一応、テロリストが１時間以内店内にいた時、とってこないので−１する必要はない、けど自分の判断しようがないので
            sendMessage('target ' + results.length-1);
        });
        console.log(`SELECT type FROM Feedback WHERE tero_id='${tero_id}'`);
        connection.query(`SELECT type FROM Feedback WHERE tero_id='${tero_id}'`, function (error, results, fields) {
            console.log(error);
            console.log(results);
            sendMessage('feedback ' + results.length);
        }); 
    }, 1000);
});



