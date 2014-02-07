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

  this.color = 'rgb(' 
                + Math.floor(Math.random() * 255) 
                + ',' 
                + Math.floor(Math.random() * 255)
                + ','
                + Math.floor(Math.random() * 255)
                + ')';

  this.name = 'box';

  this.x = 0;
  this.y = 0;

  this.id = id;

  this.update = function(x, y) {
    this.x = x; 
    this.y = y;
  };

  this.should_update = function (x, y) {
    return (
      (Math.round(this.x) != Math.round(x)) ||
      (Math.round(this.y) != Math.round(y))
    );
  };

  this.set_name = function (name) {
    if (typeof name == "undefined") {
      this.name = '#error'
    } else {
      this.name = name;
    }
  };

  this.info = function () {
    return {
      'color': this.color,
      'name': this.name,
      'id': this.id
    };
  };
};

var manager = new PlayerManager(40);

var players = {};

io.sockets.on('connection', function (socket) {
  var user = new User(manager, socket.id);
  players[user.id] = user;

  socket.broadcast.emit('new_connection', {'id': socket.id, 'color': user.color});
  socket.broadcast.emit('update_stats', user.info());
  socket.emit('connection_successful', {'id': socket.id});
  console.log("New player! ID: " + socket.id + " COLOR: " + user.color);

  // fill the user in on other players
  for (var key in players) {
    console.log(players[key].id == user.id);
    if (players[key].id != user.id) {
      console.log("updating " + user.id + " about the presence of " + players[key].id);
      socket.emit('new_connection', {
        'id': players[key].id,
        'x': players[key].x,
        'y': players[key].y,
        'color': players[key].color,
        'name': players[key].name
      });
    }
  }

  socket.on('play!', function (data) {
    user.set_name(data.name);
    console.log("Request to play from " + socket.id);
    if (manager.accept(user)) {
      console.log("...request accepted");
      socket.emit('play_accepted', {'color': user.color});
      socket.broadcast.emit('update_stats', user.info());
    } else {
      console.log("...server full");
      socket.emit('play_denied');
    }
  });

  socket.on('ping', function(data) {
    console.log("'ping' from " + socket.id);
  });

  socket.on('update!', function(data) {
    if (user.should_update(data.x, data.y)) {
      user.update(data.x, data.y);
      socket.broadcast.emit('update', {'x': data.x, 'y': data.y, 'id': socket.id});
    }
  });

  socket.on('disconnect', function() {
    console.log("lost connection: ", socket.id);
    socket.broadcast.emit('connection_lost', {'id': socket.id});
    delete players[socket.id];
  });
});

server.listen(process.env.PORT || 3000);
