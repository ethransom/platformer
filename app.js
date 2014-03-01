GLOBAL.environment = 'server';

var express = require('express');
var app = express();
var server = new (require('./server'))();

GLOBAL._ = require('underscore');
GLOBAL.Ninja = require('./ninja/ninja');

var requirejs = require('requirejs');

requirejs.config({
    nodeRequire: require
});

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
GLOBAL.io = require('socket.io').listen(http);

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

      var that = this;
      rooms[this.room].coins.forEach(function (e) {
        that.socket.emit('delete_coin!', {'r': e.r, 'c': e.c});
      });

      for (var key in players) {
        if (players[key].id != this.id && players[key].room === this.room) {
          this.socket.emit('delete_ghost!', {'id': players[key].id});
        }
      }
    }
    this.socket.join(room);
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

GLOBAL.players = {};

var rooms = {};

requirejs(['./scripts/level', './scripts/bullet'], function (Level, Bullet) {
  fs.readdirSync('levels').forEach(function (e) {
    var data = JSON.parse(fs.readFileSync('levels/' + e));
    rooms[e] = new Level(data, e);
  });

  io.sockets.on('connection', function (socket) {
    var user = new User(socket.id, socket);
    players[user.id] = user;


    socket.emit('connection_successful', {'id': socket.id});
    console.log("New player! ID: " + socket.id + " COLOR: " + user.color);



    socket.on('play!', function (data) {
      if (data.name != null)
        user.set_name(data.name);
      if (true) {
        console.log("Putting " + socket.id + " into room " + data.room);
        socket.emit('play_accepted', {'color': user.color});
        user.set_room(data.room);

        // fill the user in on coins
        rooms[data.room].coins.forEach(function (e) {
          socket.emit('create_coin!', {'r': e.r, 'c': e.c});
        });

        // fill the user in on other players
        for (var key in players) {
          if (players[key].id != user.id && players[key].room === data.room) {
            user.inform_about(players[key]);
          }
        }
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
        rooms[user.room].spawn_coins();
        return;
      }
      if (data.msg === "#unspawn_coins") {
        rooms[user.room].unspawn_coins();
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

    socket.on('shoot!', function (data) {
      console.log(user.name + " shot @ " + data.x + ", " + data.y);
      rooms[user.room].spawn_bullet(user.x, user.y, data.x, data.y, user);
    });
  });

  GLOBAL.announce = function (msg) {
    io.sockets.emit('chat_forward', {'msg': '[SERVER] ' + msg});
  };

  server.on('tick', function () {
    for (var pkey in players) {
      if (players[pkey].room == "") continue;

      for (var rkey in rooms) {
        var r = rooms[rkey];
        r.tick(players[pkey]);
      }
    }

    for (var rkey in rooms) {
      rooms[rkey].update(1000 / 60);
    }
  });

  server.start();

  var port = process.env.PORT || 3000;
  console.log("Listening on port ", port);
  http.listen(port);
});
