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

const tero_id = -1;

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  wss.on('close', () => console.log('Client disconnected'));

  wss.on('message', msg => {
      if (msg.type === 'utf8' && msg.split(' ')[0] === "tero_id") {
         tero_id = msg.split(' ')[1]; 
      }
  });

  setInterval(() => {
    connection.query(`SELECT type FROM Feedback WHERE tero_id='${tero_id}'`, function (error, results, fields) {
        console.log(error);
        console.log(tero_id);
        console.log(results);
    }); 
  }, 1000);
});



