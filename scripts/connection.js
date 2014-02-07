function Connection() {
	var socket = null; 
	this.is_open = false;
	this.id = "";
	var that = this;

	var last_x = null, last_y = null;

	this.open = function() {
		socket = io.connect('/');

		socket.on('new_connection', function (data) {
			console.log(data);
			if (Game.ghosts.hasOwnProperty(data.id)) {
				console.log("Tried to add duplicate player: " + data.id);
			} else {
				console.log("New player: '" + data.id + "' (" + data.name + ") (" + data.x + "," + data.y + ")");
				var g = new Ghost(data.id);
				g.x = parseFloat(data.x);
				g.y = parseFloat(data.y);
				g.color = data.color;
				if (data.hasOwnProperty('name')) {
					g.name = data.name;
				}
				Game.ghosts[data.id] = g;
			}
		});

		socket.on('update_stats', function (data) {
			console.log("Updating stats for " + data.id);
			if (Game.ghosts.hasOwnProperty(data.id))
				Game.ghosts[data.id].update(data);
		})

		socket.on('connection_lost', function (data) {
			console.log("Player left: ", data.id);
			delete Game.ghosts[data.id];
		})

		socket.on('connection_successful', function (data) {
			that.id = data.id; // cache our id TODO: ignore updates with this id?
			console.log("Connection successful!! ID: " + that.id);
			that.is_open = true;
			socket.emit('play!', {'name': player.name});
		});

		socket.on('play_accepted', function (data) {
			console.log("play_accepted Yay!", data.color);
			$.go('playing');
			player.color = data.color;
		});

		socket.on('play_denied', function (data) {
			console.log("denied");
			$.go('spectating');
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