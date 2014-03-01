define(['socketio', './coin', './ghost', './bullet'], function (io, Coin, Ghost, Bullet) {
	function Connection() {
		var socket = null; 
		this.is_open = false;
		this.id = "";
		var that = this;

		var last_x = null, last_y = null;

		this.open = function() {
			socket = io.connect('/');

			$.on('shoot', function (e, coords) {
				socket.emit("shoot!", {
					x: coords.x - Game.map.viewport.shift_x,
					y: coords.y - Game.map.viewport.shift_y
				});
			});

			socket.on('create_ghost!', function (data) {
				console.log(data);
				if (Game.ghosts.hasOwnProperty(data.id)) {
					console.log("Tried to add duplicate player: " + data.id);
				} else if (player.id === data.id) {
					console.log("Tried to ghost self");
				} else {
					console.log("New player: '" + data.id + "' (" + data.name + ") (" + data.x + "," + data.y + ")");
					var g = new Ghost(data.id);
					g.x = parseFloat(data.x);
					g.y = parseFloat(data.y);
					g.name = data.name;
					g.color = data.color;
					Game.ghosts[data.id] = g;
				}
			});

			socket.on('create_bullet!', function (data) {
				Game.map.bullets.push(new Bullet(data));
			});

			socket.on('move_bullet!', function (data) {
				Game.map.bullets.forEach(function (e) {
					if (e.id === data.id) {
						e.pos.x = data.x;
						e.pos.y = data.y;
					}
				});
			});

			socket.on('delete_bullet!', function (data) {
				Game.map.bullets.forEach(function (e, i, arr) {
					if (data.id === e.id) {
						arr.splice(i, 1);
					}
				});
			});

			socket.on('update_stats', function (data) {
				console.log("Updating stats for " + data.id);
				if (Game.ghosts.hasOwnProperty(data.id))
					Game.ghosts[data.id].update(data);
				else if (this.id === data.id) {
					player.update(data);
				} else {
					console.log("unorthodox add of ", data.id);

				}
			});

			socket.on('create_coin!', function (data) {
				coins.push(new Coin(data.r, data.c));
			});

			socket.on('delete_coin!', function (data) {
				coins.forEach(function (e, i, arr) {
					if (e.r === data.r && e.c === data.c) {
						arr.splice(i, 1);
					}
				});
			});

			$.on('get_chat', function () {
				var msg = prompt("What say you? ");
				if (msg != null || msg == "")
					socket.emit('chat_submit', {'msg': msg});
			});

			$.on('level_switch', function (e, name) {
				socket.emit('play!', {'room': name});
			});

			socket.on('chat_forward', function (data) {
				console.log("Got message: ", data.msg);
				chat.unshift(data.msg);
			});

			socket.on('connection_lost', function (data) {
				console.log("Player left: ", data.id);
				delete Game.ghosts[data.id];
			});

			socket.on('delete_ghost!', function (data) {
				console.log("Player left: ", data.id);
				delete Game.ghosts[data.id];
			});

			socket.on('connection_successful', function (data) {
				that.id = data.id; // cache our id TODO: ignore updates with this id?
				console.log("Connection successful!! ID: " + that.id);
				that.is_open = true;
				socket.emit('play!', {'name': player.name, 'room': Game.current_level});
			});

			socket.on('play_accepted', function (data) {
				$.go('playing');
				player.color = data.color;
			});

			socket.on('play_denied', function (data) {
				console.log("denied");
				$.go('spectating');
			});

			socket.on('increment_score!', function (data) {
				console.log(data.id, that.id);
				if (data.id == that.id) {
					player.score++;
				} else {
					Game.ghosts[data.id].coins++;
				}
			});

			socket.on('update', function (data) {
				// console.log(data.id + " moved to " + data.x + ", " + data.y);
				try {
					if (Game.ghosts.hasOwnProperty(data.id))
						Game.ghosts[data.id].move(parseFloat(data.x), parseFloat(data.y));
					else {
						console.log("moved non-existant ghost ", data.id);
						throw "error";
					}
				} catch (e) {
					console.log("Recieving updates for: " + data.id + " incorrectly");
				}
			});
		};

		this.sendUpdate = function (x, y) {
			if (this.is_open 
				&& (Math.round(x) != Math.round(last_x) || Math.round(y) != Math.round(last_y))) // don't spam the server
			{
				socket.emit('update!', {'x': x, 'y': y});
			}
		};
	};

	return Connection;

});