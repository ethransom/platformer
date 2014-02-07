var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/levels', express.static(__dirname + '/levels'));
app.use('/ninja', express.static(__dirname + '/ninja'));
app.use('/img', express.static(__dirname + '/img'));

var server = require('http').Server(app);
var io = require('socket.io').listen(server);

function PlayerManager(capacity) {
  this.players = 0;
  this.capacity = capacity;

  this.accept = function (user) {
    if ((this.players + 1) < this.capacity) {
      this.players += 1;
      user.playing = true;
      return true;
    } else {
      return false;
    }
  };
};

function User(manager, id) {
  this.manager = manager;
  this.playing = false;

  this.x = 0;
  this.y = 0;

  this.id = id;

  this.update = function(x, y) {
    this.x = x; 
    this.y = y;
  };
};

var manager = new PlayerManager(40);

var players = {};

io.sockets.on('connection', function (socket) {
  socket.broadcast.emit('new_connection', {'id': socket.id});
  socket.emit('connection_successful', {'id': socket.id});
  console.log("New player! ID: ", socket.id);

  var user = new User(manager, socket.id);
  players[user.id] = user;

  // fill the user in on other players
  for (var key in players) {
    console.log(players[key].id == user.id);
    if (players[key].id != user.id) {
      console.log("updating " + user.id + " about the presence of " + players[key].id);
      socket.emit('new_connection', {'id': socket.id});
    }
  }

  socket.on('play!', function (data) {
    console.log("Request to play from " + socket.id);
    if (manager.accept(user)) {
      console.log("...request accepted");
      socket.emit('play_accepted');
    } else {
      console.log("...server full");
      socket.emit('play_denied');
    }
  });

  socket.on('ping', function(data) {
    console.log("'ping' from " + socket.id);
  });

  socket.on('update!', function(data) {
    user.update(data.x, data.y);
    socket.broadcast.emit('update', {'x': data.x, 'y': data.y, 'id': socket.id});
  });

  socket.on('disconnect', function() {
    console.log("lost connection: ", socket.id);
    socket.broadcast.emit('connection_lost', {'id': socket.id});
  });
});

server.listen(3003);
