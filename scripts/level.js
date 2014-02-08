function Level(url) {
	Ninja.Scene.call(this);
	this.blockwidth = 64;
	this.blockheight = 64;

	this.viewport = new Viewport(null, null, this);

	this.canvas = document.createElement('canvas')
	this.ctx = this.canvas.getContext('2d');
}

Level.prototype = new Ninja.Scene();
Level.prototype.constructor = Level;

Level.prototype.draw = function (dtime, ctx) {
	this.viewport.center(player.x, player.y);
	this.viewport.draw(dtime, ctx);

	Ninja.Scene.prototype.draw.call(this, dtime, ctx);
}

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
	Game.h = this.rows.length;
	Game.w = this.rows[0].length;

	this.width = this.rows[0].length * this.blockwidth;
	this.height = this.rows.length * this.blockheight;
};

Level.prototype.load_portals = function (portals) {
	var that = this;
	portals.forEach(function (e) {
		var c = parseInt(e.x) / that.blockheight;
		var r = parseInt(e.y) / that.blockwidth;
		console.log("making teleport", that.rows, r, c);
		that.rows[r][c].teleport = e.type;
	});
}

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
