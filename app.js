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
  var user = new User(manager, socket.id);
  players[user.id] = user;

  socket.broadcast.emit('new_connection', {'id': socket.id, 'color': user.color});
  socket.broadcast.emit('update_stats', user.info());

  socket.emit('connection_successful', {'id': socket.id});
  console.log("New player! ID: " + socket.id + " COLOR: " + user.color);

  // fill the user in on coins
  coins.forEach(function (e) {
      io.sockets.emit('create_coin!', {'r': e.r, 'c': e.c});
  });

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

  socket.on('chat_submit', function (data) {
    if (data.msg === "#coins") {
      spawn_coins();
      return;
    }
    if (data.msg === "#unspawn_coins") {
      clear_coins();
      return;
    }
    if (data.msg.split(' ')[0] === "#name") {
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
    socket.broadcast.emit('chat_forward', packet);
    socket.emit('chat_forward', packet);
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

function announce(msg) {
  io.sockets.emit('chat_forward', {'msg': '[SERVER] ' + msg});
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

setInterval(function () {
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
}, 100);

server.listen(process.env.PORT || 3000);
