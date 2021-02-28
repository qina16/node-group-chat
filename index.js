const fs = require('fs');
const https = require('https');
const express = require('express');
const app = express();
//const http = require('http').Server(app);
//const io = require('socket.io')(http);

//https
const options = {
    key: fs.readFileSync('mykey.key'),
    cert: fs.readFileSync('mycert.crt')
  };
const serverPort = 443;
const server = https.createServer(options, app);
const io = require('socket.io')(server);
//https end

//point static resources like js
app.use(express.static(__dirname + '/static'));

app.get('/', function (req, res) {
    res.render('index.ejs');
});

io.on('connection', function (socket) {
    socket.on('username', function (username) {
        socket.username = username;
        io.emit('is_online', [username,socket.id]);
    });

    socket.on('disconnect', function (username) {
        io.emit('is_offline', socket.username);
    })

    socket.on('chat_message', function (message) {
        if (message[1] === '') {
            socket.broadcast.emit('chat_message', '<strong>' + socket.username + '</strong> to All: ' + message[0]);
        }
        else {
            io.to(message[1]).emit('chat_message', '<strong>' + socket.username + '</strong> to You only: ' + message[0]);
        }
    });

    socket.on('is_typing', function (username) {
        socket.broadcast.emit('is_typing', [username,socket.id]);
    });

    socket.on('not_typing', function (username) {
        socket.broadcast.emit('not_typing', username);
    });



});

server.listen(serverPort, function () {
    console.log('server up and running at %s port', serverPort);
});