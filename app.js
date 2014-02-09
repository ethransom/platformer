var express = require('express');
var app = express();
var server = new (require('./server'))();

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

app.use('/scripts', express.static(__dirname + '/scripts'));
app.use('/levels', express.static(__dirname + '/levels'));
app.use('/ninja', express.static(__dirname + '/ninja'));
app.use('/img', express.static(__dirname + '/img'));

var fs = require('fs');

app.get('/level_list.json', function (req, res) {
  var levels = fs.readdirSync('levels');
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({'levels': levels, 'default': "tiled_test.json"}));
});

var http = require('http').Server(app);
var io = require('socket.io').listen(http);

io.set('log level', 1);

function User(id, socket) {
  this.playing = false;
  this.room = "";
  this.socket = socket;
  this.coins = 0;

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

  this.set_room = function (room) {
    if (this.room !== "") {
      this.socket.leave(this.room);
      this.socket.broadcast.to(this.room).emit('delete_ghost!', {'id': socket.id});
      for (var key in players) {
        if (players[key].id != this.id && players[key].room === this.room) {
          this.socket.emit('delete_ghost!', {'id': players[key].id});
        }
      }
    }
    socket.join(room);
    this.room = room;
  };

  this.inform_about = function (player) {
    console.log("informing " + this.name + "|" + this.id + " about the presence of " + player.name);
    this.socket.emit('update_stats', player.info());
    this.socket.emit('create_ghost!', {
      'id': player.id,
      'name': player.name,
      'color': player.color,
      'x': player.x,
      'y': player.y
    });
  }

  this.update = function(x, y) {
    this.x = x; 
    this.y = y;
  };

  this.should_update = function (x, y) {
    return (true);
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

var players = {};

var coins = [];

function Coin() {
  this.r = Math.floor(Math.random() * 30);
  this.c = Math.floor(Math.random() * 15);

  io.sockets.emit('create_coin!', {'r': this.r, 'c': this.c});

  this.x = this.r * 64 + 32;
  this.y = this.c * 64 + 32;
}

function spawn_coins() {
  for (var i = 0; i < 30; i++) {
    coins.push(new Coin());
  }
}

function clear_coins() {
  coins.forEach(function (e, i, arr) {
    io.sockets.emit('delete_coin!', {'r': e.r, 'c': e.c});
  });

  var max_name = "", max_coins = 0;
  for (var key in players) {
    if (players[key].coins > max_coins) {
      max_name = players[key].name;
      max_coins = players[key].coins;
    }

    players[key].coins = 0;
  }

  announce(max_name + " was the champion with " + max_coins + " coins!");

  coins = [];
}

// spawn_coins();

io.sockets.on('connection', function (socket) {
  var user = new User(socket.id, socket);
  players[user.id] = user;


  socket.emit('connection_successful', {'id': socket.id});
  console.log("New player! ID: " + socket.id + " COLOR: " + user.color);

  // fill the user in on coins
  coins.forEach(function (e) {
    io.sockets.emit('create_coin!', {'r': e.r, 'c': e.c});
  });


  socket.on('play!', function (data) {
    if (data.name != null)
      user.set_name(data.name);
    if (true) {
      // fill the user in on other players
      for (var key in players) {
        console.log("comparing rooms", players[key].room, data.room);
        if (players[key].id != user.id && players[key].room === data.room) {
          user.inform_about(players[key]);
        }
      }
      console.log("Putting " + socket.id + " into room " + data.room);
      socket.emit('play_accepted', {'color': user.color});
      user.set_room(data.room);
      socket.broadcast.to(user.room).emit('create_ghost!', {'id': user.id});
      socket.broadcast.to(user.room).emit('update_stats', user.info());
      socket.broadcast.to(user.room).emit('update', {'x': data.x, 'y': data.y, 'id': socket.id});
    } else {
      console.log("Denied request to play from " + socket.id);
      socket.emit('play_denied');
    }
  });

  socket.on('ping', function(data) {
    console.log("'ping' from " + socket.id);
  });

  socket.on('chat_submit', function (data) {
    if (data.msg === "#coins") {
      spawn_coins();
      return;
    }
    if (data.msg === "#unspawn_coins") {
      clear_coins();
      return;
    }
    if (data.msg.split(' ')[0] == "#name") {
      announce("TWERKS!");
      var name = data.msg.split(' ')[1];
      if (name == "" || name == null) {
        socket.emit('chat_forward', {msg: 'NAME INVALID'});
        return;
      }
      user.set_name(name);
      io.sockets.emit('update_stats', user.info());
    }

    var packet = {'msg': '[' + user.name + '] ' + data.msg};
    io.sockets.emit('chat_forward', packet);
  });

  socket.on('update!', function(data) {
    if (user.should_update(data.x, data.y)) {
      user.update(data.x, data.y);
      socket.broadcast.to(user.room).emit('update', {'x': data.x, 'y': data.y, 'id': socket.id});
    }
  });

  socket.on('disconnect', function() {
    console.log("lost connection: ", socket.id);
    socket.broadcast.emit('connection_lost', {'id': socket.id});
    delete players[socket.id];
  });
});

function announce(msg) {
  io.sockets.emit('chat_forward', {'msg': '[SERVER] ' + msg});
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

server.on('tick', function () {
  for (var key in players) {
    coins.forEach(function (e, i, arr) {
      if (distance(players[key].x, players[key].y, e.x, e.y) < 40) {
        io.sockets.emit('delete_coin!', {'r': e.r, 'c': e.c});
        arr.splice(i, 1);
        players[key].coins ++;
        announce(players[key].name + " has earned a coin! (Now at " + players[key].coins + ")");
      }
    });
  }
});

http.listen(process.env.PORT || 3000);
