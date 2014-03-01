define(['./blocks', './viewport', './coin', './bullet'], function (Block, Viewport, Coin, Bullet) {

	Level.prototype = new Ninja.Scene();
	Level.prototype.constructor = Level;

	function Level(data, filename) {
		Ninja.Scene.call(this);
		this.blockwidth = 64;
		this.blockheight = 64;

		this.filename = filename;

		this.coins = [];
		this.bullets = [];

		this.players = [];

		// TODO: make this dynamic
		this.width = 30;
		this.height = 15;

		if (environment == 'client') {
			this.viewport = new Viewport(null, null, this);
		}

		// this.canvas = document.createElement('canvas')
		// this.ctx = this.canvas.getContext('2d');

		if (typeof data == 'undefined') return;

		var layers = data['layers'];

		var scenery_data, collision_data, portal_data = [];

		var that = this;
		layers.forEach(function (element) {
			if (element.name == "scenery") {
				scenery_data = element;
			} else if (element.name == "entities") {
				if (environment === 'client') {
					element['objects'].forEach(function (obj) {
						if (obj.name == "player") {
							player.x = obj.x + (that.blockwidth / 2);
							player.y = obj.y + (that.blockwidth / 2) - 64;
						} else if (obj.name === 'portal') {
							portal_data.push(obj);
						}
					});
				}
			} else if (element.name == 'collision') {
				collision_data = element;
			}
		});

		this.load(scenery_data);
		this.load_portals(portal_data);
		this.loadCollision(collision_data);

		if (environment === 'client') this.add(player);
	}

	// server only
	Level.prototype.spawn_coins = function () {
		console.log("Filling '" + this.filename + "' with coins");
		for (var i = 0; i < 30; i++) {
			var r = Math.floor(Math.random() * 15);
			var c = Math.floor(Math.random() * 30);

			if (!this.rows[r][c].walkable) {
				// try again
				i--;
				continue;
			}

			var coin = new Coin(r, c);
			this.coins.push(coin);
			io.sockets.to(this.filename).emit('create_coin!', {'r': coin.r, 'c': coin.c});
		} 
	};

	// server only
	Level.prototype.unspawn_coins = function () {
		var max_name = "", max_coins = 0;
		for (var key in players) {
			if (players[key].coins > max_coins) {
				max_name = players[key].name;
				max_coins = players[key].coins;
			}

			players[key].coins = 0;
		}

		if (max_name != "")
			announce(max_name + " was the champion with " + max_coins + " coins!");

		var that = this;
		this.coins.forEach(function (e) {
			io.sockets.to(that.file).emit('delete_coin!', {'r': e.r, 'c': e.c});
		});

		this.coins = [];
	};


	Level.prototype.draw = function (dtime, ctx) {
		this.viewport.center(player.x, player.y);
		this.viewport.draw(dtime, ctx);

		Ninja.Scene.prototype.draw.call(this, dtime, ctx);

		this.bullets.forEach(function (e) {
			e.draw(ctx);
		});
	};

	Level.prototype.update = function (dtime) {
		this.bullets.forEach(function (e, i, arr) {
			e.update(dtime);

			if (!e.alive) arr.splice(i, 1);
		});
	};

	Level.prototype.loc = function(x, y) {
		var r = Math.floor(x / this.blockwidth);
		var c = Math.floor(y / this.blockheight);
		try {
			var loc = this.rows[c][r];
			return loc;
		} catch (e) {
			var b = new Block(null, null, null, null);
			b.walkable = true;
			return b;
		}
	};

	Level.prototype.load = function(data) {
		this.data = data.data;
		this.h = data.height;
		this.w = data.width;

		this.rows = new Array(this.h);

		var i = 0;
		for (var r = 0; r < this.h; r++) {
			this.rows[r] = new Array(this.w);
			for (var c = 0; c < this.w; c++) {
				var me = 1;
				me = data.data[i];
				i += 1;
				this.rows[r][c] = Block.from_sprite_code(me - 1, c * this.blockwidth, r * this.blockheight, this.blockwidth, this.blockheight);
			}
		}

		this.width = this.rows[0].length * this.blockwidth;
		this.height = this.rows.length * this.blockheight;
	};

	Level.prototype.load_portals = function (portals) {
		var that = this;
		portals.forEach(function (e) {
			var c = parseInt(e.x) / that.blockheight;
			var r = parseInt(e.y) / that.blockwidth;
			that.rows[r][c].teleport = e.type;
		});
	};

	Level.prototype.loadCollision = function(data) {
		var d = data.data;

		var i = 0;
		for (var r = 0; r < data.height; r++) {
			for (var c = 0; c < data.width; c++) {
				var me = -1;
				me = d[i];
				i += 1;
				this.rows[r][c].walkable = (me == 19);
			}
		}
	};

	Level.prototype.tick = function (player) {
		this.coins.forEach(function (e, i, arr) {
			if (Ninja.distance(player.x, player.y, e.x, e.y) < 40) {
				io.sockets.emit('delete_coin!', {'r': e.r, 'c': e.c});
				arr.splice(i, 1);
				player.coins ++;
				io.sockets.emit('increment_score!', {'name': player.name, 'id': player.id});
				announce(player.name + " has earned a coin! (Now at " + player.coins + ")");
			}
		});

		this.bullets.forEach(function (e) {
			// console.log("dist: ", Ninja.distance(player.x, player.y, e.x, e.y));
			if (Ninja.distance(player.x, player.y, e.pos.x, e.pos.y) < 30 && e.owner != player) {
				io.sockets.emit('increment_score!', {'name': e.owner.name, 'id': e.owner.id});
				announce(e.owner.name + " has shotted " + player.name + "!");
				player.coins ++;
				e.kill();
			}
		});
	};

	Level.prototype.spawn_bullet = function (x, y, x2, y2, owner) {
		var b = new Bullet(x, y, x2, y2, this);
		b.owner = owner;
		this.bullets.push(b);
	};

	return Level;
});