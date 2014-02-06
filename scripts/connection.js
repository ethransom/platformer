function Connection() {
	var socket = null; 
	this.is_open = false;
	this.id = "";
	var that = this;

	var last_x = null, last_y = null;

	this.open = function() {
		socket = io.connect('http://localhost:3000');

		socket.on('new_connection', function (data) {
			console.log("New player: ", data.id);
			Game.ghosts[data.id] = new Ghost(data.id);
		});

		socket.on('connection_lost', function (data) {
			console.log("Player left: ", data.id);
			delete Game.ghosts[data.id];
		})

		socket.on('connection_successful', function (data) {
			that.id = data.id; // cache our id TODO: ignore updates with this id?
			console.log("Connection successful!! ID: " + that.id);
			that.is_open = true;
			socket.emit('play!');
		});

		socket.on('play_accepted', function (data) {
			console.log("play_accepted Yay!");
			$.go('playing');
		});

		socket.on('play_denied', function (data) {
			console.log("denied");
			$.go('spectating');
		});

		socket.on('update', function (data) {
			console.log(data.id + " moved to " + data.x + ", " + data.y);
			try {
				Game.ghosts[data.id].move(parseFloat(data.x), parseFloat(data.y));
			} catch (e) {
				console.log("Recieving updates for: " + data.id + " incorrectly");
			}
		});
	};

	this.sendUpdate = function (x, y) {
		if (this.is_open 
			&& (x != last_x || y != last_y)) // don't spam the server
		{
			socket.emit('update!', {'x': x, 'y': y});
		}
	};
};